const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// PostgreSQL Configuration
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

pool.on('connect', () => {
    console.log('✅ Connected to PostgreSQL successfully!');
});

pool.on('error', (err) => {
    console.error('❌ Unexpected database error:', err);
});

// ===============================================
// API ENDPOINTS
// ===============================================

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Inventory Control System API is running' });
});

// ===============================================
// DASHBOARD ENDPOINTS
// ===============================================

app.get('/api/dashboard/stats', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                (SELECT COUNT(*) FROM Products WHERE IsActive = TRUE) as TotalProducts,
                (SELECT COUNT(*) FROM Products WHERE IsActive = TRUE AND 
                    (SELECT COALESCE(SUM(Quantity), 0) FROM Inventory WHERE ProductID = Products.ProductID) <= ReorderLevel) as LowStockProducts,
                (SELECT COUNT(*) FROM Categories) as TotalCategories,
                (SELECT COUNT(*) FROM Warehouses) as TotalWarehouses,
                (SELECT COALESCE(SUM(i.Quantity * p.UnitPrice), 0) 
                 FROM Inventory i 
                 JOIN Products p ON i.ProductID = p.ProductID 
                 WHERE p.IsActive = TRUE) as TotalInventoryValue,
                (SELECT COUNT(*) FROM InventoryTransactions 
                 WHERE TransactionDate >= CURRENT_TIMESTAMP - INTERVAL '30 days') as RecentTransactions
        `);
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        res.status(500).json({ error: 'Database error', details: err.message });
    }
});

app.get('/api/dashboard/low-stock', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                p.ProductCode,
                p.ProductName,
                c.CategoryName,
                COALESCE(SUM(i.Quantity), 0) as CurrentStock,
                p.ReorderLevel,
                p.UnitPrice
            FROM Products p
            LEFT JOIN Categories c ON p.CategoryID = c.CategoryID
            LEFT JOIN Inventory i ON p.ProductID = i.ProductID
            WHERE p.IsActive = TRUE
            GROUP BY p.ProductID, p.ProductCode, p.ProductName, c.CategoryName, p.ReorderLevel, p.UnitPrice
            HAVING COALESCE(SUM(i.Quantity), 0) <= p.ReorderLevel
            ORDER BY COALESCE(SUM(i.Quantity), 0) ASC
            LIMIT 10
        `);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching low stock products:', err);
        res.status(500).json({ error: 'Database error', details: err.message });
    }
});

app.get('/api/dashboard/recent-transactions', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                t.TransactionID,
                t.TransactionType,
                t.Quantity,
                t.TransactionDate,
                t.Notes,
                p.ProductCode,
                p.ProductName,
                w.WarehouseName
            FROM InventoryTransactions t
            JOIN Products p ON t.ProductID = p.ProductID
            JOIN Warehouses w ON t.WarehouseID = w.WarehouseID
            ORDER BY t.TransactionDate DESC
            LIMIT 10
        `);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching recent transactions:', err);
        res.status(500).json({ error: 'Database error', details: err.message });
    }
});

// ===============================================
// PRODUCTS ENDPOINTS
// ===============================================

app.get('/api/products', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                p.*,
                c.CategoryName,
                s.SupplierName,
                COALESCE(SUM(i.Quantity), 0) as TotalStock
            FROM Products p
            LEFT JOIN Categories c ON p.CategoryID = c.CategoryID
            LEFT JOIN Suppliers s ON p.SupplierID = s.SupplierID
            LEFT JOIN Inventory i ON p.ProductID = i.ProductID
            WHERE p.IsActive = TRUE
            GROUP BY p.ProductID, p.ProductCode, p.ProductName, p.Description, 
                     p.CategoryID, p.SupplierID, p.UnitPrice, p.ReorderLevel, 
                     p.UnitsInStock, p.ImageURL, p.IsActive, p.CreatedDate, p.UpdatedDate,
                     c.CategoryName, s.SupplierName
            ORDER BY p.ProductName
        `);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching products:', err);
        res.status(500).json({ error: 'Database error', details: err.message });
    }
});

app.get('/api/products/:id', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                p.*,
                c.CategoryName,
                s.SupplierName,
                COALESCE(SUM(i.Quantity), 0) as TotalStock
            FROM Products p
            LEFT JOIN Categories c ON p.CategoryID = c.CategoryID
            LEFT JOIN Suppliers s ON p.SupplierID = s.SupplierID
            LEFT JOIN Inventory i ON p.ProductID = i.ProductID
            WHERE p.ProductID = $1
            GROUP BY p.ProductID, p.ProductCode, p.ProductName, p.Description, 
                     p.CategoryID, p.SupplierID, p.UnitPrice, p.ReorderLevel, 
                     p.UnitsInStock, p.ImageURL, p.IsActive, p.CreatedDate, p.UpdatedDate,
                     c.CategoryName, s.SupplierName
        `, [req.params.id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error fetching product:', err);
        res.status(500).json({ error: 'Database error', details: err.message });
    }
});

app.post('/api/products', async (req, res) => {
    try {
        const { ProductCode, ProductName, Description, CategoryID, SupplierID, UnitPrice, ReorderLevel, ImageURL } = req.body;
        const result = await pool.query(`
            INSERT INTO Products (ProductCode, ProductName, Description, CategoryID, SupplierID, UnitPrice, ReorderLevel, ImageURL)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
        `, [ProductCode, ProductName, Description, CategoryID, SupplierID, UnitPrice, ReorderLevel, ImageURL]);
        
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error creating product:', err);
        res.status(500).json({ error: 'Database error', details: err.message });
    }
});

app.put('/api/products/:id', async (req, res) => {
    try {
        const { ProductCode, ProductName, Description, CategoryID, SupplierID, UnitPrice, ReorderLevel, ImageURL, IsActive } = req.body;
        const result = await pool.query(`
            UPDATE Products 
            SET ProductCode = $1, ProductName = $2, Description = $3, CategoryID = $4, 
                SupplierID = $5, UnitPrice = $6, ReorderLevel = $7, ImageURL = $8, 
                IsActive = $9, UpdatedDate = CURRENT_TIMESTAMP
            WHERE ProductID = $10
            RETURNING *
        `, [ProductCode, ProductName, Description, CategoryID, SupplierID, UnitPrice, ReorderLevel, ImageURL, IsActive, req.params.id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating product:', err);
        res.status(500).json({ error: 'Database error', details: err.message });
    }
});

app.delete('/api/products/:id', async (req, res) => {
    try {
        const result = await pool.query(`
            UPDATE Products SET IsActive = FALSE, UpdatedDate = CURRENT_TIMESTAMP WHERE ProductID = $1 RETURNING *
        `, [req.params.id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json({ message: 'Product deactivated successfully' });
    } catch (err) {
        console.error('Error deleting product:', err);
        res.status(500).json({ error: 'Database error', details: err.message });
    }
});

// ===============================================
// INVENTORY ENDPOINTS
// ===============================================

app.get('/api/inventory', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                i.*,
                p.ProductCode,
                p.ProductName,
                p.UnitPrice,
                w.WarehouseName,
                c.CategoryName
            FROM Inventory i
            JOIN Products p ON i.ProductID = p.ProductID
            JOIN Warehouses w ON i.WarehouseID = w.WarehouseID
            LEFT JOIN Categories c ON p.CategoryID = c.CategoryID
            WHERE p.IsActive = TRUE
            ORDER BY p.ProductName, w.WarehouseName
        `);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching inventory:', err);
        res.status(500).json({ error: 'Database error', details: err.message });
    }
});

app.post('/api/inventory/adjust', async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        const { ProductID, WarehouseID, Quantity, TransactionType, Notes, UserName } = req.body;
        
        // Check if inventory record exists
        const inventoryCheck = await client.query(
            'SELECT * FROM Inventory WHERE ProductID = $1 AND WarehouseID = $2',
            [ProductID, WarehouseID]
        );
        
        if (inventoryCheck.rows.length === 0) {
            // Create new inventory record
            await client.query(`
                INSERT INTO Inventory (ProductID, WarehouseID, Quantity, LastRestockDate)
                VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
            `, [ProductID, WarehouseID, TransactionType === 'IN' ? Quantity : 0]);
        } else {
            // Update existing inventory
            const currentQty = inventoryCheck.rows[0].quantity;
            const newQty = TransactionType === 'IN' ? currentQty + Quantity : currentQty - Quantity;
            
            if (newQty < 0) {
                throw new Error('Insufficient inventory');
            }
            
            await client.query(`
                UPDATE Inventory 
                SET Quantity = $1, LastRestockDate = CURRENT_TIMESTAMP, UpdatedDate = CURRENT_TIMESTAMP
                WHERE ProductID = $2 AND WarehouseID = $3
            `, [newQty, ProductID, WarehouseID]);
        }
        
        // Record transaction
        await client.query(`
            INSERT INTO InventoryTransactions (ProductID, WarehouseID, TransactionType, Quantity, Notes, UserName)
            VALUES ($1, $2, $3, $4, $5, $6)
        `, [ProductID, WarehouseID, TransactionType, Quantity, Notes, UserName]);
        
        await client.query('COMMIT');
        res.json({ message: 'Inventory adjusted successfully' });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error adjusting inventory:', err);
        res.status(500).json({ error: 'Database error', details: err.message });
    } finally {
        client.release();
    }
});

// ===============================================
// CATEGORIES ENDPOINTS
// ===============================================

app.get('/api/categories', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM Categories ORDER BY CategoryName');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching categories:', err);
        res.status(500).json({ error: 'Database error', details: err.message });
    }
});

app.post('/api/categories', async (req, res) => {
    try {
        const { CategoryName, Description } = req.body;
        const result = await pool.query(`
            INSERT INTO Categories (CategoryName, Description)
            VALUES ($1, $2)
            RETURNING *
        `, [CategoryName, Description]);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error creating category:', err);
        res.status(500).json({ error: 'Database error', details: err.message });
    }
});

app.put('/api/categories/:id', async (req, res) => {
    try {
        const { CategoryName, Description } = req.body;
        const result = await pool.query(`
            UPDATE Categories 
            SET CategoryName = $1, Description = $2, UpdatedDate = CURRENT_TIMESTAMP
            WHERE CategoryID = $3
            RETURNING *
        `, [CategoryName, Description, req.params.id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Category not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating category:', err);
        res.status(500).json({ error: 'Database error', details: err.message });
    }
});

app.delete('/api/categories/:id', async (req, res) => {
    try {
        const result = await pool.query('DELETE FROM Categories WHERE CategoryID = $1 RETURNING *', [req.params.id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Category not found' });
        }
        res.json({ message: 'Category deleted successfully' });
    } catch (err) {
        console.error('Error deleting category:', err);
        res.status(500).json({ error: 'Database error', details: err.message });
    }
});

// ===============================================
// SUPPLIERS ENDPOINTS
// ===============================================

app.get('/api/suppliers', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM Suppliers ORDER BY SupplierName');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching suppliers:', err);
        res.status(500).json({ error: 'Database error', details: err.message });
    }
});

app.post('/api/suppliers', async (req, res) => {
    try {
        const { SupplierName, ContactPerson, Email, Phone, Address, City, Country } = req.body;
        const result = await pool.query(`
            INSERT INTO Suppliers (SupplierName, ContactPerson, Email, Phone, Address, City, Country)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `, [SupplierName, ContactPerson, Email, Phone, Address, City, Country]);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error creating supplier:', err);
        res.status(500).json({ error: 'Database error', details: err.message });
    }
});

app.put('/api/suppliers/:id', async (req, res) => {
    try {
        const { SupplierName, ContactPerson, Email, Phone, Address, City, Country } = req.body;
        const result = await pool.query(`
            UPDATE Suppliers 
            SET SupplierName = $1, ContactPerson = $2, Email = $3, Phone = $4, 
                Address = $5, City = $6, Country = $7, UpdatedDate = CURRENT_TIMESTAMP
            WHERE SupplierID = $8
            RETURNING *
        `, [SupplierName, ContactPerson, Email, Phone, Address, City, Country, req.params.id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Supplier not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating supplier:', err);
        res.status(500).json({ error: 'Database error', details: err.message });
    }
});

app.delete('/api/suppliers/:id', async (req, res) => {
    try {
        const result = await pool.query('DELETE FROM Suppliers WHERE SupplierID = $1 RETURNING *', [req.params.id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Supplier not found' });
        }
        res.json({ message: 'Supplier deleted successfully' });
    } catch (err) {
        console.error('Error deleting supplier:', err);
        res.status(500).json({ error: 'Database error', details: err.message });
    }
});

// ===============================================
// WAREHOUSES ENDPOINTS
// ===============================================

app.get('/api/warehouses', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM Warehouses ORDER BY WarehouseName');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching warehouses:', err);
        res.status(500).json({ error: 'Database error', details: err.message });
    }
});

app.post('/api/warehouses', async (req, res) => {
    try {
        const { WarehouseName, Location, Capacity, ManagerName, Phone } = req.body;
        const result = await pool.query(`
            INSERT INTO Warehouses (WarehouseName, Location, Capacity, ManagerName, Phone)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `, [WarehouseName, Location, Capacity, ManagerName, Phone]);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error creating warehouse:', err);
        res.status(500).json({ error: 'Database error', details: err.message });
    }
});

app.put('/api/warehouses/:id', async (req, res) => {
    try {
        const { WarehouseName, Location, Capacity, ManagerName, Phone } = req.body;
        const result = await pool.query(`
            UPDATE Warehouses 
            SET WarehouseName = $1, Location = $2, Capacity = $3, ManagerName = $4, 
                Phone = $5, UpdatedDate = CURRENT_TIMESTAMP
            WHERE WarehouseID = $6
            RETURNING *
        `, [WarehouseName, Location, Capacity, ManagerName, Phone, req.params.id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Warehouse not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating warehouse:', err);
        res.status(500).json({ error: 'Database error', details: err.message });
    }
});

app.delete('/api/warehouses/:id', async (req, res) => {
    try {
        const result = await pool.query('DELETE FROM Warehouses WHERE WarehouseID = $1 RETURNING *', [req.params.id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Warehouse not found' });
        }
        res.json({ message: 'Warehouse deleted successfully' });
    } catch (err) {
        console.error('Error deleting warehouse:', err);
        res.status(500).json({ error: 'Database error', details: err.message });
    }
});

// ===============================================
// REPORTS ENDPOINTS
// ===============================================

app.get('/api/reports/inventory-value', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                w.WarehouseName,
                COUNT(DISTINCT i.ProductID) as ProductCount,
                SUM(i.Quantity) as TotalUnits,
                SUM(i.Quantity * p.UnitPrice) as TotalValue
            FROM Inventory i
            JOIN Products p ON i.ProductID = p.ProductID
            JOIN Warehouses w ON i.WarehouseID = w.WarehouseID
            WHERE p.IsActive = TRUE
            GROUP BY w.WarehouseID, w.WarehouseName
            ORDER BY TotalValue DESC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching inventory value report:', err);
        res.status(500).json({ error: 'Database error', details: err.message });
    }
});

app.get('/api/reports/stock-levels', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM vw_ProductStockLevels ORDER BY TotalStock ASC');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching stock levels report:', err);
        res.status(500).json({ error: 'Database error', details: err.message });
    }
});

app.get('/api/reports/transactions', async (req, res) => {
    try {
        const { startDate, endDate, type } = req.query;
        let query = `
            SELECT 
                t.*,
                p.ProductCode,
                p.ProductName,
                w.WarehouseName
            FROM InventoryTransactions t
            JOIN Products p ON t.ProductID = p.ProductID
            JOIN Warehouses w ON t.WarehouseID = w.WarehouseID
            WHERE 1=1
        `;
        const params = [];
        
        if (startDate) {
            params.push(startDate);
            query += ` AND t.TransactionDate >= $${params.length}`;
        }
        if (endDate) {
            params.push(endDate);
            query += ` AND t.TransactionDate <= $${params.length}`;
        }
        if (type) {
            params.push(type);
            query += ` AND t.TransactionType = $${params.length}`;
        }
        
        query += ' ORDER BY t.TransactionDate DESC LIMIT 100';
        
        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching transactions report:', err);
        res.status(500).json({ error: 'Database error', details: err.message });
    }
});

// ===============================================
// START SERVER
// ===============================================

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully...');
    await pool.end();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('\nSIGINT received, shutting down gracefully...');
    await pool.end();
    process.exit(0);
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`API Documentation: http://localhost:${PORT}/api/health`);
});
