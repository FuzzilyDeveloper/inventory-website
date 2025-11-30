-- ===============================================
-- Inventory Control System Database Schema
-- PostgreSQL Database
-- ===============================================

-- ===============================================
-- Table: Categories
-- ===============================================
CREATE TABLE IF NOT EXISTS Categories (
    CategoryID SERIAL PRIMARY KEY,
    CategoryName VARCHAR(100) NOT NULL,
    Description VARCHAR(500),
    CreatedDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===============================================
-- Table: Suppliers
-- ===============================================
CREATE TABLE IF NOT EXISTS Suppliers (
    SupplierID SERIAL PRIMARY KEY,
    SupplierName VARCHAR(200) NOT NULL,
    ContactPerson VARCHAR(100),
    Email VARCHAR(100),
    Phone VARCHAR(20),
    Address VARCHAR(500),
    City VARCHAR(100),
    Country VARCHAR(100),
    CreatedDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===============================================
-- Table: Warehouses
-- ===============================================
CREATE TABLE IF NOT EXISTS Warehouses (
    WarehouseID SERIAL PRIMARY KEY,
    WarehouseName VARCHAR(200) NOT NULL,
    Location VARCHAR(500),
    Capacity INTEGER,
    ManagerName VARCHAR(100),
    Phone VARCHAR(20),
    CreatedDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===============================================
-- Table: Products
-- ===============================================
CREATE TABLE IF NOT EXISTS Products (
    ProductID SERIAL PRIMARY KEY,
    ProductCode VARCHAR(50) UNIQUE NOT NULL,
    ProductName VARCHAR(200) NOT NULL,
    Description VARCHAR(1000),
    CategoryID INTEGER REFERENCES Categories(CategoryID),
    SupplierID INTEGER REFERENCES Suppliers(SupplierID),
    UnitPrice DECIMAL(18, 2) NOT NULL,
    ReorderLevel INTEGER DEFAULT 10,
    UnitsInStock INTEGER DEFAULT 0,
    ImageURL VARCHAR(500),
    IsActive BOOLEAN DEFAULT TRUE,
    CreatedDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===============================================
-- Table: Inventory
-- ===============================================
CREATE TABLE IF NOT EXISTS Inventory (
    InventoryID SERIAL PRIMARY KEY,
    ProductID INTEGER NOT NULL REFERENCES Products(ProductID),
    WarehouseID INTEGER NOT NULL REFERENCES Warehouses(WarehouseID),
    Quantity INTEGER NOT NULL DEFAULT 0,
    LastRestockDate TIMESTAMP,
    CreatedDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(ProductID, WarehouseID)
);

-- ===============================================
-- Table: InventoryTransactions
-- ===============================================
CREATE TABLE IF NOT EXISTS InventoryTransactions (
    TransactionID SERIAL PRIMARY KEY,
    ProductID INTEGER NOT NULL REFERENCES Products(ProductID),
    WarehouseID INTEGER NOT NULL REFERENCES Warehouses(WarehouseID),
    TransactionType VARCHAR(20) NOT NULL, -- 'IN', 'OUT', 'ADJUSTMENT'
    Quantity INTEGER NOT NULL,
    TransactionDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Notes VARCHAR(500),
    UserName VARCHAR(100)
);

-- ===============================================
-- Insert Sample Data
-- ===============================================

-- Categories
INSERT INTO Categories (CategoryName, Description) VALUES
('Electronics', 'Electronic devices and components'),
('Furniture', 'Office and home furniture'),
('Office Supplies', 'General office supplies and stationery'),
('Tools', 'Hardware and power tools'),
('Clothing', 'Apparel and accessories')
ON CONFLICT DO NOTHING;

-- Suppliers
INSERT INTO Suppliers (SupplierName, ContactPerson, Email, Phone, Address, City, Country) VALUES
('Tech Distributors Inc', 'John Smith', 'john@techdist.com', '+1-555-0101', '123 Tech Street', 'New York', 'USA'),
('Office World Ltd', 'Sarah Johnson', 'sarah@officeworld.com', '+1-555-0102', '456 Commerce Ave', 'Chicago', 'USA'),
('Global Supplies Co', 'Mike Chen', 'mike@globalsupplies.com', '+1-555-0103', '789 Trade Blvd', 'Los Angeles', 'USA'),
('Premium Furniture', 'Emily Davis', 'emily@premiumfurn.com', '+1-555-0104', '321 Design Lane', 'Miami', 'USA')
ON CONFLICT DO NOTHING;

-- Warehouses
INSERT INTO Warehouses (WarehouseName, Location, Capacity, ManagerName, Phone) VALUES
('Main Warehouse', '1000 Industrial Pkwy, Dallas, TX', 50000, 'Robert Brown', '+1-555-0201'),
('East Coast Facility', '500 Harbor Dr, Boston, MA', 30000, 'Jennifer Wilson', '+1-555-0202'),
('West Coast Depot', '2000 Port Ave, Seattle, WA', 40000, 'David Martinez', '+1-555-0203')
ON CONFLICT DO NOTHING;

-- Products
INSERT INTO Products (ProductCode, ProductName, Description, CategoryID, SupplierID, UnitPrice, ReorderLevel, UnitsInStock) VALUES
('ELEC-001', 'Wireless Mouse', 'Ergonomic wireless mouse with USB receiver', 1, 1, 29.99, 20, 150),
('ELEC-002', 'USB-C Hub', '7-in-1 USB-C Hub with HDMI and USB 3.0', 1, 1, 49.99, 15, 85),
('ELEC-003', 'Webcam HD', '1080p HD Webcam with built-in microphone', 1, 1, 79.99, 10, 45),
('FURN-001', 'Office Chair', 'Ergonomic mesh office chair with lumbar support', 2, 4, 299.99, 5, 30),
('FURN-002', 'Standing Desk', 'Adjustable height standing desk, 60x30 inches', 2, 4, 499.99, 3, 12),
('OFFC-001', 'Notebook Pack', 'Pack of 5 spiral notebooks, college ruled', 3, 2, 12.99, 50, 200),
('OFFC-002', 'Pen Set', 'Premium ballpoint pen set, 12 pieces', 3, 2, 19.99, 40, 180),
('OFFC-003', 'Paper Ream', 'Letter size copy paper, 500 sheets', 3, 2, 8.99, 100, 450),
('TOOL-001', 'Cordless Drill', '20V cordless drill with battery and charger', 4, 3, 129.99, 8, 25),
('TOOL-002', 'Tool Set', '100-piece mechanics tool set with case', 4, 3, 89.99, 10, 35),
('CLTH-001', 'Work Gloves', 'Heavy-duty work gloves, size L', 5, 3, 14.99, 30, 120),
('CLTH-002', 'Safety Vest', 'High-visibility safety vest, reflective', 5, 3, 9.99, 25, 95)
ON CONFLICT (ProductCode) DO NOTHING;

-- Inventory (distribute products across warehouses)
INSERT INTO Inventory (ProductID, WarehouseID, Quantity, LastRestockDate) VALUES
-- Main Warehouse
(1, 1, 80, CURRENT_TIMESTAMP - INTERVAL '10 days'),
(2, 1, 45, CURRENT_TIMESTAMP - INTERVAL '8 days'),
(3, 1, 25, CURRENT_TIMESTAMP - INTERVAL '5 days'),
(4, 1, 15, CURRENT_TIMESTAMP - INTERVAL '12 days'),
(5, 1, 6, CURRENT_TIMESTAMP - INTERVAL '15 days'),
(6, 1, 100, CURRENT_TIMESTAMP - INTERVAL '3 days'),
(7, 1, 90, CURRENT_TIMESTAMP - INTERVAL '4 days'),
(8, 1, 250, CURRENT_TIMESTAMP - INTERVAL '2 days'),
(9, 1, 12, CURRENT_TIMESTAMP - INTERVAL '7 days'),
(10, 1, 18, CURRENT_TIMESTAMP - INTERVAL '9 days'),
(11, 1, 60, CURRENT_TIMESTAMP - INTERVAL '6 days'),
(12, 1, 50, CURRENT_TIMESTAMP - INTERVAL '5 days'),
-- East Coast Facility
(1, 2, 40, CURRENT_TIMESTAMP - INTERVAL '12 days'),
(2, 2, 25, CURRENT_TIMESTAMP - INTERVAL '10 days'),
(3, 2, 12, CURRENT_TIMESTAMP - INTERVAL '8 days'),
(6, 2, 60, CURRENT_TIMESTAMP - INTERVAL '6 days'),
(7, 2, 55, CURRENT_TIMESTAMP - INTERVAL '7 days'),
(8, 2, 120, CURRENT_TIMESTAMP - INTERVAL '4 days'),
-- West Coast Depot
(1, 3, 30, CURRENT_TIMESTAMP - INTERVAL '9 days'),
(2, 3, 15, CURRENT_TIMESTAMP - INTERVAL '11 days'),
(3, 3, 8, CURRENT_TIMESTAMP - INTERVAL '13 days'),
(4, 3, 9, CURRENT_TIMESTAMP - INTERVAL '14 days'),
(5, 3, 6, CURRENT_TIMESTAMP - INTERVAL '16 days'),
(9, 3, 8, CURRENT_TIMESTAMP - INTERVAL '10 days'),
(10, 3, 12, CURRENT_TIMESTAMP - INTERVAL '11 days'),
(11, 3, 35, CURRENT_TIMESTAMP - INTERVAL '8 days'),
(12, 3, 30, CURRENT_TIMESTAMP - INTERVAL '7 days')
ON CONFLICT (ProductID, WarehouseID) DO NOTHING;

-- Sample Transactions
INSERT INTO InventoryTransactions (ProductID, WarehouseID, TransactionType, Quantity, TransactionDate, Notes, UserName) VALUES
(1, 1, 'IN', 100, CURRENT_TIMESTAMP - INTERVAL '10 days', 'Initial stock', 'Admin'),
(1, 1, 'OUT', 20, CURRENT_TIMESTAMP - INTERVAL '5 days', 'Sales order #1001', 'Admin'),
(2, 1, 'IN', 50, CURRENT_TIMESTAMP - INTERVAL '8 days', 'Restock from supplier', 'Admin'),
(3, 1, 'IN', 30, CURRENT_TIMESTAMP - INTERVAL '5 days', 'New shipment', 'Admin'),
(3, 1, 'OUT', 5, CURRENT_TIMESTAMP - INTERVAL '2 days', 'Customer order', 'Admin'),
(8, 1, 'IN', 300, CURRENT_TIMESTAMP - INTERVAL '2 days', 'Bulk purchase', 'Admin'),
(8, 1, 'OUT', 50, CURRENT_TIMESTAMP - INTERVAL '1 day', 'Office distribution', 'Admin');

-- ===============================================
-- Useful Views
-- ===============================================

-- View: Product Stock Levels
DROP VIEW IF EXISTS vw_ProductStockLevels;
CREATE VIEW vw_ProductStockLevels AS
SELECT 
    p.ProductID,
    p.ProductCode,
    p.ProductName,
    c.CategoryName,
    s.SupplierName,
    p.UnitPrice,
    p.ReorderLevel,
    COALESCE(SUM(i.Quantity), 0) as TotalStock,
    CASE 
        WHEN COALESCE(SUM(i.Quantity), 0) = 0 THEN 'Out of Stock'
        WHEN COALESCE(SUM(i.Quantity), 0) <= p.ReorderLevel THEN 'Low Stock'
        ELSE 'In Stock'
    END as StockStatus
FROM Products p
LEFT JOIN Categories c ON p.CategoryID = c.CategoryID
LEFT JOIN Suppliers s ON p.SupplierID = s.SupplierID
LEFT JOIN Inventory i ON p.ProductID = i.ProductID
WHERE p.IsActive = TRUE
GROUP BY p.ProductID, p.ProductCode, p.ProductName, c.CategoryName, 
         s.SupplierName, p.UnitPrice, p.ReorderLevel;

-- View: Inventory by Warehouse
DROP VIEW IF EXISTS vw_InventoryByWarehouse;
CREATE VIEW vw_InventoryByWarehouse AS
SELECT 
    w.WarehouseName,
    p.ProductCode,
    p.ProductName,
    c.CategoryName,
    i.Quantity,
    p.UnitPrice,
    (i.Quantity * p.UnitPrice) as TotalValue,
    i.LastRestockDate
FROM Inventory i
JOIN Products p ON i.ProductID = p.ProductID
JOIN Warehouses w ON i.WarehouseID = w.WarehouseID
JOIN Categories c ON p.CategoryID = c.CategoryID
WHERE p.IsActive = TRUE;
