-- Execute this script to setup the Plants table and stored procedure
-- Run this in your SQL Server Management Studio or Azure Data Studio

-- Step 1: Create Plants table and insert sample data
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Plants')
BEGIN
    CREATE TABLE Plants (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        PlantName NVARCHAR(200) NOT NULL,
        Location NVARCHAR(200),
        IsActive BIT DEFAULT 1,
        CreatedAt DATETIME DEFAULT GETUTCDATE(),
        UpdatedAt DATETIME DEFAULT GETUTCDATE()
    );
    
    PRINT 'Plants table created successfully.';
END
ELSE
BEGIN
    PRINT 'Plants table already exists.';
END
GO

-- Step 2: Insert sample plant data (if table is empty)
IF NOT EXISTS (SELECT * FROM Plants)
BEGIN
    INSERT INTO Plants (PlantName, Location, IsActive) VALUES
    ('Plant A - Manufacturing', 'Mumbai', 1),
    ('Plant B - Production', 'Delhi', 1),
    ('Plant C - Assembly', 'Bangalore', 1),
    ('Plant D - Processing', 'Chennai', 1),
    ('Plant E - Distribution', 'Pune', 1);
    
    PRINT 'Sample plant data inserted successfully.';
END
ELSE
BEGIN
    PRINT 'Plants table already contains data.';
END
GO

-- Step 3: Create or alter the stored procedure
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_GetPlants')
BEGIN
    DROP PROCEDURE sp_GetPlants;
    PRINT 'Existing sp_GetPlants procedure dropped.';
END
GO

CREATE PROCEDURE sp_GetPlants
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Return all active plants ordered by name
    SELECT 
        Id,
        PlantName,
        Location,
        IsActive,
        CreatedAt
    FROM Plants
    WHERE IsActive = 1
    ORDER BY PlantName;
END
GO

PRINT 'Stored procedure sp_GetPlants created successfully.';
PRINT '';
PRINT 'Setup complete! You can now use the Plant dropdown in the dashboard.';
PRINT 'The API endpoint /api/plants will call sp_GetPlants stored procedure.';
GO

