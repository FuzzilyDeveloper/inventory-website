# Inventory Control System

A professional, full-featured inventory management system built with Node.js, Express, and SQL Server. This application provides comprehensive inventory tracking, product management, warehouse operations, and detailed reporting capabilities.

## Features

### 📊 Dashboard
- Real-time inventory statistics
- Low stock alerts
- Recent transaction history
- Key performance indicators

### 📦 Product Management
- Create, read, update, and delete products
- Product categorization
- Supplier tracking
- Reorder level monitoring
- Stock status indicators

### 🏭 Inventory Control
- Multi-warehouse support
- Stock adjustments (IN/OUT/ADJUSTMENT)
- Real-time stock levels
- Transaction logging
- Inventory value tracking

### 📁 Categories
- Organize products by category
- Product count per category
- Easy category management

### 🚚 Suppliers
- Supplier contact information
- Product-supplier relationships
- Supplier performance tracking

### 🏢 Warehouses
- Multiple warehouse locations
- Capacity management
- Warehouse-specific inventory
- Manager assignments

### 📈 Reports & Analytics
- Inventory value by warehouse
- Category breakdown analysis
- Transaction history
- Customizable date ranges
- Export capabilities

## Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web application framework
- **mssql** - SQL Server database driver
- **dotenv** - Environment configuration
- **CORS** - Cross-origin resource sharing

### Frontend
- **HTML5** - Markup
- **CSS3** - Modern, responsive styling
- **Vanilla JavaScript** - Client-side functionality
- **Font Awesome** - Icon library

### Database
- **Microsoft SQL Server** - Relational database

## Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v14 or higher)
- [SQL Server](https://www.microsoft.com/en-us/sql-server/sql-server-downloads) (2016 or higher)
- A modern web browser (Chrome, Firefox, Edge, Safari)

## Installation

### 1. Clone or Download the Project

Navigate to your project directory:
```powershell
cd "d:\ML\inventory website"
```

### 2. Install Dependencies

Install the required Node.js packages:
```powershell
npm install
```

This will install:
- express
- mssql
- body-parser
- cors
- dotenv

### 3. Configure SQL Server Database

#### Option A: Using SQL Server Management Studio (SSMS)

1. Open SQL Server Management Studio
2. Connect to your SQL Server instance
3. Open the file `database/schema.sql`
4. Execute the script to create the database and sample data

#### Option B: Using Command Line

```powershell
sqlcmd -S localhost -U your_username -P your_password -i "database\schema.sql"
```

### 4. Configure Environment Variables

Create a `.env` file in the root directory:
```powershell
Copy-Item .env.example .env
```

Edit the `.env` file with your SQL Server credentials:
```env
# SQL Server Configuration
DB_SERVER=localhost
DB_DATABASE=InventoryDB
DB_USER=your_username
DB_PASSWORD=your_password
DB_PORT=1433
DB_ENCRYPT=true
DB_TRUST_CERTIFICATE=true

# Server Configuration
PORT=3000
```

**Important Configuration Notes:**

- **DB_SERVER**: Your SQL Server instance name (e.g., `localhost`, `.\SQLEXPRESS`, or `server\instance`)
- **DB_USER**: SQL Server login username
- **DB_PASSWORD**: SQL Server login password
- **DB_ENCRYPT**: Set to `true` for Azure SQL Database, can be `false` for local development
- **DB_TRUST_CERTIFICATE**: Set to `true` for self-signed certificates in development

### 5. Start the Application

Start the server:
```powershell
npm start
```

For development with auto-reload:
```powershell
npm run dev
```

The server will start on `http://localhost:3000`

### 6. Access the Application

Open your web browser and navigate to:
```
http://localhost:3000
```

## Database Schema

The application uses the following main tables:

### Products
Stores product information including code, name, description, pricing, and stock levels.

### Categories
Product categorization for better organization.

### Suppliers
Supplier information and contact details.

### Warehouses
Storage facility information and capacity.

### Inventory
Links products to warehouses with quantity tracking.

### InventoryTransactions
Complete audit trail of all inventory movements.

## API Endpoints

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/low-stock` - Get low stock products
- `GET /api/dashboard/recent-transactions` - Get recent transactions

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product (soft delete)

### Inventory
- `GET /api/inventory` - Get all inventory records
- `POST /api/inventory/adjust` - Adjust inventory levels

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create new category

### Suppliers
- `GET /api/suppliers` - Get all suppliers
- `POST /api/suppliers` - Create new supplier

### Warehouses
- `GET /api/warehouses` - Get all warehouses
- `POST /api/warehouses` - Create new warehouse

### Reports
- `GET /api/reports/inventory-value` - Get inventory value by warehouse
- `GET /api/reports/category-breakdown` - Get category breakdown
- `GET /api/reports/transactions` - Get transaction history

## Project Structure

```
inventory website/
├── database/
│   └── schema.sql              # Database creation script
├── public/
│   ├── css/
│   │   └── styles.css          # Application styles
│   ├── js/
│   │   ├── app.js              # Common functions
│   │   ├── dashboard.js        # Dashboard functionality
│   │   ├── products.js         # Product management
│   │   ├── inventory.js        # Inventory management
│   │   ├── categories.js       # Category management
│   │   ├── suppliers.js        # Supplier management
│   │   ├── warehouses.js       # Warehouse management
│   │   └── reports.js          # Reports & analytics
│   ├── index.html              # Dashboard page
│   ├── products.html           # Products page
│   ├── inventory.html          # Inventory page
│   ├── categories.html         # Categories page
│   ├── suppliers.html          # Suppliers page
│   ├── warehouses.html         # Warehouses page
│   └── reports.html            # Reports page
├── server.js                   # Express server & API
├── package.json                # Node.js dependencies
├── .env.example                # Environment variables template
├── .gitignore                  # Git ignore rules
└── README.md                   # This file
```

## Usage Guide

### Adding a New Product

1. Navigate to the **Products** page
2. Click **Add Product** button
3. Fill in the product details:
   - Product Code (unique identifier)
   - Product Name
   - Description
   - Category
   - Supplier
   - Unit Price
   - Reorder Level
4. Click **Save Product**

### Adjusting Inventory

1. Navigate to the **Inventory** page
2. Click **Adjust Inventory** button
3. Select:
   - Product
   - Warehouse
   - Transaction Type (IN/OUT/ADJUSTMENT)
   - Quantity
4. Add notes (optional)
5. Click **Submit**

### Viewing Reports

1. Navigate to the **Reports** page
2. Select a report tab:
   - Inventory Value
   - Category Breakdown
   - Transactions
3. Use filters to customize the view
4. Data updates automatically

## Troubleshooting

### Cannot Connect to Database

**Error**: `ConnectionError: Failed to connect to SQL Server`

**Solutions**:
1. Verify SQL Server is running
2. Check connection string in `.env` file
3. Ensure SQL Server accepts TCP/IP connections
4. Verify firewall allows port 1433
5. Check SQL Server authentication mode

### Port Already in Use

**Error**: `Error: listen EADDRINUSE: address already in use :::3000`

**Solution**:
Change the PORT in `.env` file to a different number (e.g., 3001, 8080)

### SQL Server Authentication Failed

**Solutions**:
1. Verify username and password in `.env`
2. Check SQL Server authentication mode (Mixed Mode required for SQL authentication)
3. Ensure user has necessary permissions on InventoryDB

### Module Not Found

**Error**: `Cannot find module 'express'`

**Solution**:
```powershell
npm install
```

## Security Considerations

**For Production Deployment:**

1. **Environment Variables**: Never commit `.env` file to version control
2. **Database**: Use strong passwords and restricted user permissions
3. **CORS**: Configure CORS to allow only trusted domains
4. **HTTPS**: Use SSL/TLS certificates for encrypted connections
5. **Authentication**: Implement user authentication and authorization
6. **Input Validation**: Add server-side validation for all inputs
7. **SQL Injection**: Use parameterized queries (already implemented)
8. **Error Handling**: Don't expose sensitive error details to clients

## Future Enhancements

- User authentication and role-based access control
- Barcode scanning support
- Email notifications for low stock
- Purchase order management
- Advanced reporting with charts
- Export to Excel/PDF
- Mobile responsive improvements
- Real-time updates with WebSockets
- Multi-language support
- Dark mode theme

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review SQL Server connection settings
3. Verify all dependencies are installed
4. Check browser console for JavaScript errors

## License

MIT License - Feel free to use this project for learning and development purposes.

## Acknowledgments

- Built with Express.js and Node.js
- UI Icons by Font Awesome
- Database: Microsoft SQL Server

---

**Version**: 1.0.0  
**Last Updated**: November 2025  
**Status**: Demo/Development
