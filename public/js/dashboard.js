// ===============================================
// Dashboard Page Functionality
// ===============================================

document.addEventListener('DOMContentLoaded', () => {
    loadDashboardStats();
    loadLowStockProducts();
    loadRecentTransactions();
});

// Load dashboard statistics
async function loadDashboardStats() {
    try {
        const stats = await apiGet('/dashboard/stats');
        
        document.getElementById('totalProducts').textContent = stats.TotalProducts || 0;
        document.getElementById('lowStockProducts').textContent = stats.LowStockProducts || 0;
        document.getElementById('totalValue').textContent = formatCurrency(stats.TotalInventoryValue || 0);
        document.getElementById('recentTransactions').textContent = stats.RecentTransactions || 0;
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
    }
}

// Load low stock products
async function loadLowStockProducts() {
    try {
        const products = await apiGet('/dashboard/low-stock');
        const tableBody = document.getElementById('lowStockTable');
        
        if (products.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6" class="text-center">No low stock items</td></tr>';
            return;
        }
        
        tableBody.innerHTML = products.map(product => `
            <tr>
                <td>${product.ProductCode}</td>
                <td>${product.ProductName}</td>
                <td>${product.CategoryName || 'N/A'}</td>
                <td><span class="font-bold ${product.CurrentStock === 0 ? 'text-danger' : 'text-warning'}">${product.CurrentStock}</span></td>
                <td>${product.ReorderLevel}</td>
                <td>
                    <span class="status-badge ${product.CurrentStock === 0 ? 'status-empty' : 'status-low'}">
                        ${product.CurrentStock === 0 ? 'Out of Stock' : 'Low Stock'}
                    </span>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading low stock products:', error);
        document.getElementById('lowStockTable').innerHTML = 
            '<tr><td colspan="6" class="text-center">Error loading data</td></tr>';
    }
}

// Load recent transactions
async function loadRecentTransactions() {
    try {
        const transactions = await apiGet('/dashboard/recent-transactions');
        const tableBody = document.getElementById('transactionsTable');
        
        if (transactions.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6" class="text-center">No recent transactions</td></tr>';
            return;
        }
        
        tableBody.innerHTML = transactions.map(transaction => `
            <tr>
                <td>${formatDateShort(transaction.TransactionDate)}</td>
                <td>${transaction.ProductCode} - ${transaction.ProductName}</td>
                <td>${transaction.WarehouseName}</td>
                <td>
                    <span class="status-badge transaction-${transaction.TransactionType.toLowerCase()}">
                        ${transaction.TransactionType}
                    </span>
                </td>
                <td>${transaction.Quantity}</td>
                <td>${transaction.UserName}</td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading recent transactions:', error);
        document.getElementById('transactionsTable').innerHTML = 
            '<tr><td colspan="6" class="text-center">Error loading data</td></tr>';
    }
}
