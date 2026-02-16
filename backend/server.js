require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const auth = require('./middleware/auth');

const app = express();

const { sql, poolPromise } = require('./db');



// In-memory store for refresh tokens (for production, persist in DB)
const refreshTokens = new Set();

// Middleware
app.use(cors({ 
  origin: [
    process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
    'http://localhost:5174'
  ], 
  credentials: true 
}));
app.use(express.json());
app.use(cookieParser());

// Health check
app.get('/', (req, res) => {
  res.send('API is running');
});

// ============ PRE-REGISTRATION EMAIL VERIFICATION ============

// ============ REGISTRATION ============

/**
 * STEP 1: Registration - Validate and create user account
 * User registration endpoint
 */
app.post('/api/register', async (req, res) => {
  try {
    const {
      fullName,
      dob,
      email,
      contactNumber,
      position,
      gender,
      password,
      confirmPassword,
    } = req.body;

    // Validation
    if (
      !fullName ||
      !dob ||
      !email ||
      !contactNumber ||
      !position ||
      !gender ||
      !password ||
      !confirmPassword
    ) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required.',
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Password and Confirm Password do not match.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters.',
      });
    }

    // Validate contact number - exactly 10 digits
    const contactRegex = /^\d{10}$/;
    if (!contactRegex.test(contactNumber)) {
      return res.status(400).json({
        success: false,
        message: 'Contact number must be exactly 10 digits.',
      });
    }

    // Check if all digits are the same (e.g., 9999999999, 0000000000)
    if (/^(\d)\1{9}$/.test(contactNumber)) {
      return res.status(400).json({
        success: false,
        message: 'Contact number cannot contain all same digits.',
      });
    }

    const pool = await poolPromise;
    if (!pool) {
      console.error('Attempted registration while DB not connected');
      return res.status(500).json({ success: false, message: 'Database not connected' });
    }

    // Check if email already exists
    const existingUser = await pool
      .request()
      .input('email', sql.VarChar, email)
      .query('SELECT Id FROM Online_Training_Users1 WHERE Email = @email');

    if (existingUser.recordset.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered. Please use a different email or login.',
      });
    }

    // Hash password using bcrypt
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert new user (account is active immediately)
    const result = await pool
      .request()
      .input('fullName', sql.NVarChar, fullName)
      .input('dob', sql.Date, dob)
      .input('email', sql.NVarChar, email)
      .input('contactNumber', sql.NVarChar, contactNumber)
      .input('position', sql.NVarChar, position)
      .input('gender', sql.NVarChar, gender)
      .input('passwordHash', sql.NVarChar, passwordHash)
      .input('role', sql.NVarChar, 'EMPLOYEE')
      .input('isActive', sql.Bit, 1) // Account active immediately
      .query(
        `INSERT INTO Online_Training_Users1 
         (FullName, DOB, Email, ContactNumber, Position, Gender, PasswordHash, Role, IsActive, CreatedAt)
         VALUES (@fullName, @dob, @email, @contactNumber, @position, @gender, @passwordHash, @role, @isActive, GETUTCDATE());
         SELECT SCOPE_IDENTITY() AS Id;`
      );

    const userId = result.recordset[0].Id;

    return res.status(201).json({
      success: true,
      message: 'Registration successful! You can now login.',
      userId,
      email,
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Registration failed: ' + (error.message || 'Internal server error'),
    });
  }
});

// ============ USER PROFILE ============

// ============ PLANT DROPDOWN API ============
// GET plants using stored procedure

app.get('/api/plants', auth, async (req, res) => {
  try {
    const pool = await poolPromise;
    if (!pool) {
      console.error('Attempted to fetch plants while DB not connected');
      return res.status(500).json({ success: false, message: 'Database not connected' });
    }

    // Execute stored procedure to get plants
    const result = await pool
      .request()
      .execute('get_plantname');

    const plants = result.recordset.map((plant) => ({
      id: plant.nPlantNo,
      name: plant.vPlantName,
      plantNo: plant.nPlantNo
    }));
 

    return res.json({
      success: true,
      plants: plants,
      message: 'Plants fetched successfully'
    });

  } catch (error) {
    console.error('Error fetching plants:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch plants: ' + (error.message || 'Internal server error'),
      plants: []
    });
  }
});

// Get documents for selected plant
app.get('/api/plants/:plantNo/documents', auth, async (req, res) => {
  try {
    const { plantNo } = req.params;
    
    console.log('Fetching documents for plant number:', plantNo);
    
    if (!plantNo) {
      return res.status(400).json({
        success: false,
        message: 'Plant number is required'
      });
    }

    const pool = await poolPromise;
    if (!pool) {
      console.error('Attempted to fetch plant documents while DB not connected');
      return res.status(500).json({ success: false, message: 'Database not connected' });
    }

    // Execute stored procedure to get plant-wise documents
    const result = await pool
      .request()
      .input('PlantNo', sql.Int, plantNo)
      .execute('usp_GetPlantWiseSelectedDocTypes');

    console.log('Documents fetched:', result.recordset.length, 'documents');
    console.log('Sample document:', result.recordset[0]);
    console.log('Document columns:', Object.keys(result.recordset[0] || {}));

    return res.json({
      success: true,
      documents: result.recordset,
      message: 'Documents fetched successfully'
    });

  } catch (error) {
    console.error('Error fetching plant documents:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch documents: ' + (error.message || 'Internal server error'),
      documents: []
    });
  }
});

// Get document data for selected plant and document type
app.get('/api/plants/:plantNo/documents/:docTypeCode/data', auth, async (req, res) => {
  try {
    const { plantNo, docTypeCode } = req.params;
    
    console.log('Fetching document data for plant:', plantNo, 'docType:', docTypeCode);
    
    if (!plantNo || !docTypeCode) {
      return res.status(400).json({
        success: false,
        message: 'Plant number and document type code are required'
      });
    }

    const pool = await poolPromise;
    if (!pool) {
      console.error('Attempted to fetch document data while DB not connected');
      return res.status(500).json({ success: false, message: 'Database not connected' });
    }

    // Execute stored procedure to get plant document data
    const result = await pool
      .request()
      .input('PlantNo', sql.Int, plantNo)
      .input('DocTypeCode', sql.VarChar, docTypeCode)
      .execute('usp_GetPlantDocumentData');

    console.log('Document data fetched:', result.recordset.length, 'records');

    return res.json({
      success: true,
      data: result.recordset,
      message: 'Document data fetched successfully'
    });

  } catch (error) {
    console.error('Error fetching document data:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch document data: ' + (error.message || 'Internal server error'),
      data: []
    });
  }
});

// ============ LOGIN FLOW ============

// Login route
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
    }

    const pool = await poolPromise;
    if (!pool) {
      console.error('Attempted login while DB not connected');
      return res.status(500).json({ success: false, message: 'Database not connected' });
    }

    // Lookup user by email
    const result = await pool
      .request()
      .input('email', sql.VarChar, email)
      .query('SELECT TOP 1 Id, Email, FullName, Role, IsActive, PasswordHash FROM Online_Training_Users1 WHERE Email = @email');

    if (!result.recordset || result.recordset.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const user = result.recordset[0];

    if (!user.IsActive) {
      return res.status(403).json({ success: false, message: 'User account is inactive.' });
    }

    const passwordMatch = await bcrypt.compare(password, user.PasswordHash);
    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // Create JWT tokens
    const accessToken = jwt.sign({ id: user.Id, role: user.Role }, process.env.JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ id: user.Id, role: user.Role }, process.env.REFRESH_TOKEN_SECRET || (process.env.JWT_SECRET + '_rt'), { expiresIn: '7d' });

    // Store refresh token (in-memory). Replace with DB storage in production.
    refreshTokens.add(refreshToken);

    // Set refresh token in httpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({ success: true, message: 'Login successful.', user: { Id: user.Id, Email: user.Email, FullName: user.FullName, Role: user.Role }, accessToken });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error.',
    });
  }
});

// Refresh token endpoint
app.post('/api/refresh', (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) return res.status(401).json({ success: false, message: 'No refresh token provided' });
    if (!refreshTokens.has(token)) return res.status(403).json({ success: false, message: 'Invalid refresh token' });

    const payload = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET || (process.env.JWT_SECRET + '_rt'));
    const accessToken = jwt.sign({ id: payload.id, role: payload.role }, process.env.JWT_SECRET, { expiresIn: '15m' });
    return res.json({ success: true, accessToken });
  } catch (err) {
    console.error('Refresh token error:', err);
    return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
  }
});

// Logout route
app.post('/api/logout', (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (token && refreshTokens.has(token)) refreshTokens.delete(token);
    res.clearCookie('refreshToken');
    return res.json({ success: true, message: 'Logged out' });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ success: false, message: 'Error logging out' });
  }
});

// ============ ERROR HANDLING ============

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});



