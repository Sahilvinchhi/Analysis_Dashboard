-- QUICK REFERENCE: Expected Table Structure
-- This is a template showing what your table structure should look like
-- Adjust the names and data types according to your actual database

/*
Expected Table Structure (Example):

CREATE TABLE YourTableName (
    PlantNo INT,
    DocTypeCode VARCHAR(50),
    Division VARCHAR(100),
    CustomerCode VARCHAR(50),
    CustomerName VARCHAR(200),
    FinancialYear VARCHAR(20),
    GrossTotal DECIMAL(18,2),
    NetInvoiceAmt DECIMAL(18,2),
    TotalTaxAmt DECIMAL(18,2),
    TotalDocAmt DECIMAL(18,2),
    -- Other columns...
)

Sample Data:
PlantNo | DocTypeCode | Division | CustomerCode | CustomerName    | FinancialYear | GrossTotal | NetInvoiceAmt | TotalTaxAmt | TotalDocAmt
--------|-------------|----------|--------------|-----------------|---------------|------------|---------------|-------------|-------------
1       | INV         | East     | CUST001      | ABC Corp        | FY 2023-24    | 10000.00   | 9500.00       | 1500.00     | 11000.00
1       | INV         | East     | CUST002      | XYZ Ltd         | FY 2023-24    | 20000.00   | 19000.00      | 3000.00     | 22000.00
1       | INV         | West     | CUST003      | PQR Inc         | FY 2023-24    | 15000.00   | 14250.00      | 2250.00     | 16500.00
2       | PO          | North    | CUST004      | LMN Company     | FY 2024-25    | 30000.00   | 28500.00      | 4500.00     | 33000.00
*/

-- EXAMPLE: If your actual table is named "DocumentTransactions" 
-- and columns are named differently, here's how to modify the stored procedures:

-- ============================================================================
-- EXAMPLE 1: Your table structure
-- ============================================================================
/*
Your table: DocumentTransactions
Columns:
  - Plant_Number (instead of PlantNo)
  - Document_Type (instead of DocTypeCode)
  - Div (instead of Division)
  - Cust_Code (instead of CustomerCode)
  - Cust_Name (instead of CustomerName)
  - Fin_Year (instead of FinancialYear)
  - Gross_Amt (instead of GrossTotal)
  - Net_Amt (instead of NetInvoiceAmt)
  - Tax_Amt (instead of TotalTaxAmt)
  - Total_Amt (instead of TotalDocAmt)
*/

-- Modified usp_GetDivisions for above structure:
/*
CREATE PROCEDURE usp_GetDivisions
    @PlantNo INT,
    @DocTypeCode VARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT DISTINCT 
        Div AS Division
    FROM 
        DocumentTransactions
    WHERE 
        Plant_Number = @PlantNo
        AND Document_Type = @DocTypeCode
        AND Div IS NOT NULL
    ORDER BY 
        Div;
END
*/

-- Modified usp_GetCustomersByDivision for above structure:
/*
CREATE PROCEDURE usp_GetCustomersByDivision
    @PlantNo INT,
    @DocTypeCode VARCHAR(50),
    @Division VARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT DISTINCT 
        Cust_Code AS CustomerCode,
        Cust_Name AS CustomerName
    FROM 
        DocumentTransactions
    WHERE 
        Plant_Number = @PlantNo
        AND Document_Type = @DocTypeCode
        AND Div = @Division
        AND Cust_Name IS NOT NULL
    ORDER BY 
        Cust_Name;
END
*/

-- Modified usp_GetPlantDocumentData for above structure:
/*
CREATE PROCEDURE usp_GetPlantDocumentData
    @PlantNo INT,
    @DocTypeCode VARCHAR(50),
    @Division VARCHAR(100) = NULL,
    @CustomerCode VARCHAR(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        Fin_Year AS FinancialYear,
        Div AS Division,
        Cust_Code AS CustomerCode,
        Cust_Name AS CustomerName,
        SUM(Gross_Amt) AS GrossTotal,
        SUM(Net_Amt) AS NetInvoiceAmt,
        SUM(Tax_Amt) AS TotalTaxAmt,
        SUM(Total_Amt) AS TotalDocAmt
    FROM 
        DocumentTransactions
    WHERE 
        Plant_Number = @PlantNo
        AND Document_Type = @DocTypeCode
        AND (@Division IS NULL OR Div = @Division)
        AND (@CustomerCode IS NULL OR Cust_Code = @CustomerCode)
    GROUP BY 
        Fin_Year,
        Div,
        Cust_Code,
        Cust_Name
    ORDER BY 
        Fin_Year;
END
*/

-- ============================================================================
-- INSTRUCTIONS TO CUSTOMIZE FOR YOUR DATABASE
-- ============================================================================

-- Step 1: Identify your actual table name
--         Replace "YourTableName" with your actual table name

-- Step 2: Map your column names to the expected ones:
--         Expected Name     →  Your Actual Column Name
--         ---------------------------------------------
--         PlantNo           →  _________________
--         DocTypeCode       →  _________________
--         Division          →  _________________
--         CustomerCode      →  _________________
--         CustomerName      →  _________________
--         FinancialYear     →  _________________
--         GrossTotal        →  _________________
--         NetInvoiceAmt     →  _________________
--         TotalTaxAmt       →  _________________
--         TotalDocAmt       →  _________________

-- Step 3: Open SETUP_DIVISION_CUSTOMER.sql
-- Step 4: Replace all instances of "YourTableName" with your actual table
-- Step 5: Replace all column names with your actual column names
-- Step 6: Execute the modified script in SQL Server

-- ============================================================================
-- TESTING QUERIES
-- ============================================================================

-- Test 1: Check if you have division data
-- SELECT DISTINCT Division FROM YourTableName WHERE PlantNo = 1 AND DocTypeCode = 'YourDocCode';

-- Test 2: Check if you have customer data
-- SELECT DISTINCT CustomerCode, CustomerName 
-- FROM YourTableName 
-- WHERE PlantNo = 1 AND DocTypeCode = 'YourDocCode' AND Division = 'YourDivision';

-- Test 3: Check if you have financial year data
-- SELECT FinancialYear, Division, CustomerName, 
--        SUM(GrossTotal) as Total_Gross,
--        SUM(NetInvoiceAmt) as Total_Net,
--        SUM(TotalTaxAmt) as Total_Tax,
--        SUM(TotalDocAmt) as Total_Doc
-- FROM YourTableName
-- WHERE PlantNo = 1 AND DocTypeCode = 'YourDocCode'
-- GROUP BY FinancialYear, Division, CustomerName
-- ORDER BY FinancialYear;

-- ============================================================================
