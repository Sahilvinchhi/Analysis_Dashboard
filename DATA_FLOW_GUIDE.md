# Complete Data Flow Guide: SQL Server → Backend → Frontend → User

## Overview: How Data Flows from Database to User Interface

This guide explains the complete flow using **"Get Plant Names"** as a real example from your project.

---

## 🔄 The Complete Flow

```
SQL Server (SP) → Backend API (Node.js) → Frontend API Layer (TypeScript) → React Component → User Interface
```

---

## Step 1: Create Stored Procedure in SQL Server

**File: Your SQL Server Database**

```sql
-- Create stored procedure to get plant names
CREATE PROCEDURE get_plantname
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        nPlantNo,           -- Plant ID/Number
        vPlantName          -- Plant Name
    FROM tbl_Plants
    WHERE bActive = 1       -- Only active plants
    ORDER BY vPlantName;
END
GO
```

**What this does:**
- Creates a stored procedure named `get_plantname`
- Returns plant number and name from `tbl_Plants` table
- Filters only active plants
- Orders results by plant name

---

## Step 2: Backend API Endpoint (Node.js/Express)

**File:** [backend/server.js](backend/server.js#L168-L203)

```javascript
// Import required modules at top of file
const { sql, poolPromise } = require('./db');
const auth = require('./middleware/auth');

// Create API endpoint that calls the stored procedure
app.get('/api/plants', auth, async (req, res) => {
  try {
    // Get database connection pool
    const pool = await poolPromise;
    
    // Check if database is connected
    if (!pool) {
      return res.status(500).json({ 
        success: false, 
        message: 'Database not connected' 
      });
    }

    // Execute stored procedure
    const result = await pool
      .request()                    // Create new request
      .execute('get_plantname');    // Execute SP by name

    // Transform database results to match frontend needs
    const plants = result.recordset.map((plant) => ({
      id: plant.nPlantNo,           // Plant ID
      name: plant.vPlantName,       // Plant Name  
      plantNo: plant.nPlantNo       // Plant Number (duplicate for convenience)
    }));

    // Send success response
    return res.json({
      success: true,
      plants: plants,
      message: 'Plants fetched successfully'
    });

  } catch (error) {
    // Handle errors
    console.error('Error fetching plants:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch plants: ' + error.message,
      plants: []
    });
  }
});
```

**What this does:**
1. **Route**: Creates `/api/plants` endpoint
2. **Authentication**: Uses `auth` middleware to verify user token
3. **Database**: Gets connection pool and executes stored procedure
4. **Transform**: Converts database column names to frontend-friendly names
5. **Response**: Returns JSON with success status and data
6. **Error Handling**: Catches and returns errors gracefully

---

## Step 3: Frontend API Layer (TypeScript)

**File:** [frontend/src/api.ts](frontend/src/api.ts#L130-L165)

```typescript
/**
 * Core API request function with authentication
 */

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { skipAuth = false, headers = {}, ...restOptions } = options;

  // Prepare headers with authentication token
  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(headers as Record<string, string>),
  };

  // Add JWT token for authentication
  if (!skipAuth) {
    const token = getAccessToken();
    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`;
    }
  }

  // Make HTTP request to backend
  const url = endpoint.startsWith('http') 
    ? endpoint 
    : `${API_BASE_URL}${endpoint}`;
    
  let response = await fetch(url, {
    ...restOptions,
    headers: requestHeaders,
    credentials: 'include',
  });

  // Handle token refresh if unauthorized
  if (response.status === 401 && !skipAuth) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      requestHeaders['Authorization'] = `Bearer ${newToken}`;
      response = await fetch(url, {
        ...restOptions,
        headers: requestHeaders,
        credentials: 'include',
      });
    }
  }

  const data = await response.json();
  return data;
}

/**
 * Simplified API methods
 */
export const api = {
  get: <T = any>(endpoint: string, options?: RequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: 'GET' }),
    
  post: <T = any>(endpoint: string, data?: any, options?: RequestOptions) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),
};

/**
 * Plant-specific API methods
 */
export const plantApi = {
  // Get all plants from stored procedure
  getPlants: () => api.get('/api/plants'),
};

export default api;
```

**What this does:**
1. **Authentication**: Automatically adds JWT token to requests
2. **Token Refresh**: Handles token expiration and refresh
3. **Type Safety**: TypeScript ensures type checking
4. **Reusable**: Create once, use everywhere
5. **Error Handling**: Centralized error handling

---

## Step 4: React Component (Frontend UI)

**File:** [frontend/src/dashboard.tsx](frontend/src/dashboard.tsx#L240-L300)

```tsx
import React, { useEffect, useState } from 'react';
import api from './api';

// Define TypeScript interface for Plant data
interface Plant {
  id: number;
  name: string;
  plantNo: number;
}

function Dashboard() {
  // State management
  const [plants, setPlants] = useState<Plant[]>([]);
  const [selectedPlant, setSelectedPlant] = useState<string>('Select Plant');
  const [selectedPlantNo, setSelectedPlantNo] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

  // Load plants when component mounts
  useEffect(() => {
    fetchPlants();
  }, []);

  /**
   * Fetch plants from API
   */
  const fetchPlants = async () => {
    try {
      setLoading(true);
      
      // Call backend API
      const data = await api.get('/api/plants');
      
      // Check response and update state
      if (data.success) {
        setPlants(data.plants);
      } else {
        setError(data.message || 'Failed to load plants');
      }
    } catch (err) {
      console.error('Error fetching plants:', err);
      setError('Unable to load plants');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle plant selection from dropdown
   */
  const handlePlantSelect = (plant: Plant) => {
    setSelectedPlant(plant.name);
    setSelectedPlantNo(plant.plantNo);
    setIsDropdownOpen(false);
  };

  /**
   * Render the UI
   */
  return (
    <div className="dashboard">
      <div className="dropdown-container">
        {/* Plant Dropdown Button */}
        <button 
          className="dropdown-button"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          {loading ? 'Loading...' : selectedPlant}
          <span className="dropdown-icon">▼</span>
        </button>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div className="dropdown-menu">
            {error ? (
              <div className="error-message">{error}</div>
            ) : (
              plants.map((plant) => (
                <div
                  key={plant.id}
                  className="dropdown-item"
                  onClick={() => handlePlantSelect(plant)}
                >
                  {plant.name}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
```

**What this does:**
1. **State Management**: Uses React hooks to manage data and UI state
2. **Data Fetching**: Calls API when component loads (`useEffect`)
3. **User Interaction**: Handles dropdown open/close and plant selection
4. **Loading States**: Shows loading indicator while fetching
5. **Error Handling**: Displays error messages if something fails
6. **Display**: Renders plant names in a dropdown for user selection

---

## 📊 Complete Flow Summary

### 1. **SQL Server**
```sql
get_plantname → Returns: nPlantNo, vPlantName
```

### 2. **Backend API** (`/api/plants`)
```javascript
pool.request().execute('get_plantname')
→ Transforms data
→ Returns: { success: true, plants: [{id, name, plantNo}] }
```

### 3. **Frontend API Layer**
```typescript
api.get('/api/plants')
→ Adds authentication token
→ Handles errors
→ Returns: data object
```

### 4. **React Component**
```typescript
fetchPlants() → updates state → renders UI → user sees dropdown
```

---

## 🎯 Quick Reference: Adding Your Own Endpoint

### Step-by-Step Template

#### 1. Create Stored Procedure
```sql
CREATE PROCEDURE sp_GetYourData
AS
BEGIN
    SELECT Column1, Column2 
    FROM YourTable
    WHERE SomeCondition = 1;
END
GO
```

#### 2. Backend API Endpoint
```javascript
app.get('/api/your-endpoint', auth, async (req, res) => {
  try {
    const pool = await poolPromise;
    if (!pool) {
      return res.status(500).json({ 
        success: false, 
        message: 'Database not connected' 
      });
    }

    const result = await pool
      .request()
      .execute('sp_GetYourData');

    const data = result.recordset.map((row) => ({
      field1: row.Column1,
      field2: row.Column2
    }));

    return res.json({
      success: true,
      data: data
    });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});
```

#### 3. Frontend API Method
```typescript
export const yourApi = {
  getData: () => api.get('/api/your-endpoint'),
};
```

#### 4. React Component
```tsx
const [data, setData] = useState([]);

useEffect(() => {
  const fetchData = async () => {
    const response = await api.get('/api/your-endpoint');
    if (response.success) {
      setData(response.data);
    }
  };
  fetchData();
}, []);
```

---

## 🔍 Key Points to Remember

1. **Stored Procedure Names**: Must match exactly in backend (e.g., `get_plantname`)
2. **Column Names**: SQL column names (e.g., `nPlantNo`) are mapped to JavaScript object properties
3. **Authentication**: Most endpoints need `auth` middleware for security
4. **Error Handling**: Always wrap database calls in try-catch
5. **Response Format**: Backend should return consistent format: `{ success: boolean, data/message }`
6. **TypeScript Types**: Define interfaces for type safety in frontend
7. **State Management**: Use React hooks (useState, useEffect) for data and UI state

---

## 📝 Testing Your Flow

### 1. Test Stored Procedure in SQL Server
```sql
EXEC get_plantname;
-- Should return rows with nPlantNo and vPlantName
```

### 2. Test Backend API with Postman or Browser
```
GET http://localhost:5000/api/plants
Headers: Authorization: Bearer <your-token>
```

### 3. Check Frontend Console
```javascript
console.log('Plants data:', data);
```

### 4. Verify UI Display
- Check if dropdown shows plant names
- Test selection functionality

---

## ❓ Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "Database not connected" | Check .env file has correct DB credentials |
| "401 Unauthorized" | Ensure JWT token is valid, login again |
| "Stored procedure not found" | Verify SP name matches exactly (case-sensitive) |
| "Cannot read property" | Check column names match between SQL and JavaScript |
| Empty dropdown | Check browser console for errors, verify data format |
| CORS errors | Ensure backend cors settings include frontend URL |

---

## 📚 Related Files

- SQL Setup: [backend/SETUP_PLANTS.sql](backend/SETUP_PLANTS.sql)
- Backend API: [backend/server.js](backend/server.js#L168)
- Database Config: [backend/db.js](backend/db.js)
- Frontend API: [frontend/src/api.ts](frontend/src/api.ts#L152)
- Dashboard Component: [frontend/src/dashboard.tsx](frontend/src/dashboard.tsx#L240)

---

**Created:** February 2026
**Project:** Training Project - Data Flow Documentation
