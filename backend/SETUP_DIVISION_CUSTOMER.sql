-- Execute this script to setup Division and Customer dropdowns
-- Run this in your SQL Server Management Studio or Azure Data Studio

-- Step 1: Create stored procedure to get all divisions
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'usp_GetDivisions')
BEGIN
    DROP PROCEDURE usp_GetDivisions;
    PRINT 'Existing usp_GetDivisions procedure dropped.';
END
GO

CREATE PROCEDURE usp_GetDivisions
    @PlantNo INT,
    @DocTypeCode VARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Get distinct divisions for the selected plant and document type
    -- Adjust the table/column names based on your actual database schema
    SELECT DISTINCT 
        Division
    FROM 
        -- Replace 'YourTableName' with your actual table name
        -- This assumes you have a table with columns: PlantNo, DocTypeCode, Division
        YourTableName
    WHERE 
        PlantNo = @PlantNo
        AND DocTypeCode = @DocTypeCode
        AND Division IS NOT NULL
    ORDER BY 
        Division;
END
GO

PRINT 'Stored procedure usp_GetDivisions created successfully.';
GO

-- Step 2: Create stored procedure to get customers by division
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'usp_GetCustomersByDivision')
BEGIN
    DROP PROCEDURE usp_GetCustomersByDivision;
    PRINT 'Existing usp_GetCustomersByDivision procedure dropped.';
END
GO

CREATE PROCEDURE usp_GetCustomersByDivision
    @PlantNo INT,
    @DocTypeCode VARCHAR(50),
    @Division VARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Get distinct customers for the selected plant, document type, and division
    -- Adjust the table/column names based on your actual database schema
    SELECT DISTINCT 
        CustomerCode,
        CustomerName
    FROM 
        -- Replace 'YourTableName' with your actual table name
        -- This assumes you have columns: PlantNo, DocTypeCode, Division, CustomerCode, CustomerName
        YourTableName
    WHERE 
        PlantNo = @PlantNo
        AND DocTypeCode = @DocTypeCode
        AND Division = @Division
        AND CustomerName IS NOT NULL
    ORDER BY 
        CustomerName;
END
GO

PRINT 'Stored procedure usp_GetCustomersByDivision created successfully.';
GO

-- Step 3: Update the usp_GetPlantDocumentData procedure to accept Division and Customer filters
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'usp_GetPlantDocumentData')
BEGIN
    DROP PROCEDURE usp_GetPlantDocumentData;
    PRINT 'Existing usp_GetPlantDocumentData procedure dropped.';
END
GO

CREATE PROCEDURE usp_GetPlantDocumentData
    @PlantNo INT,
    @DocTypeCode VARCHAR(50),
    @Division VARCHAR(100) = NULL,  -- Optional division filter
    @CustomerCode VARCHAR(50) = NULL  -- Optional customer filter
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Get financial year-wise document data with optional division and customer filters
    -- Adjust this query based on your actual database schema
    SELECT 
        FinancialYear,
        Division,
        CustomerCode,
        CustomerName,
        SUM(GrossTotal) AS GrossTotal,
        SUM(NetInvoiceAmt) AS NetInvoiceAmt,
        SUM(TotalTaxAmt) AS TotalTaxAmt,
        SUM(TotalDocAmt) AS TotalDocAmt
    FROM 
        -- Replace 'YourTableName' with your actual table name
        YourTableName
    WHERE 
        PlantNo = @PlantNo
        AND DocTypeCode = @DocTypeCode
        AND (@Division IS NULL OR Division = @Division)
        AND (@CustomerCode IS NULL OR CustomerCode = @CustomerCode)
    GROUP BY 
        FinancialYear,
        Division,
        CustomerCode,
        CustomerName
    ORDER BY 
        FinancialYear;
END
GO

PRINT 'Stored procedure usp_GetPlantDocumentData updated successfully.';
PRINT '';
PRINT 'Setup complete! You now have:';
PRINT '1. usp_GetDivisions - Gets all divisions for a plant/document';
PRINT '2. usp_GetCustomersByDivision - Gets customers for a specific division';
PRINT '3. usp_GetPlantDocumentData - Updated to support division and customer filtering';
PRINT '';
PRINT 'IMPORTANT: Replace YourTableName with your actual table name in all procedures!';
PRINT 'Adjust column names based on your actual database schema.';
GO
