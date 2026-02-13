const jwt = require('jsonwebtoken');


function auth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: 'No token provided' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}

module.exports = auth;

const express = require("express");
const router = express.Router();
const sql = require("mssql"); // your DB connection


// GET /verify-email?token=xxxx
router.get("/verify-email", async (req, res) => {
  const token = req.query.token;

  if (!token) return res.status(400).send("Invalid token");

  try {
    const pool = await sql.connect(/* your config */);

    // Get user with token
    const result = await pool.request()
      .input("token", sql.NVarChar, token)
      .query("SELECT * FROM Users WHERE EmailVerifyToken = @token");

    const user = result.recordset[0];
    if (!user) return res.status(400).send("Invalid token");

    // Check if token expired
    const now = new Date();
    if (user.EmailVerifyTokenExpiry < now) {
      return res.status(400).send("Token expired. Please register again.");
    }

    // Update user as verified
    await pool.request()
      .input("userId", sql.Int, user.Id)
      .query(`
        UPDATE Users 
        SET IsEmailVerified = 1, 
            EmailVerifyToken = NULL,
            EmailVerifyTokenExpiry = NULL
        WHERE Id = @userId
      `);

    res.redirect("http://localhost:5173/login?verified=true");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

module.exports = router;
