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
        
        document.getElementById('totalProducts').textContent = stats.totalproducts || 0;
        document.getElementById('lowStockProducts').textContent = stats.lowstockproducts || 0;
        document.getElementById('totalValue').textContent = formatCurrency(stats.totalinventoryvalue || 0);
        document.getElementById('recentTransactions').textContent = stats.recenttransactions || 0;
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
                <td>${product.productcode}</td>
                <td>${product.productname}</td>
                <td>${product.categoryname || 'N/A'}</td>
                <td><span class="font-bold ${product.currentstock === 0 ? 'text-danger' : 'text-warning'}">${product.currentstock}</span></td>
                <td>${product.reorderlevel}</td>
                <td>
                    <span class="status-badge ${product.currentstock === 0 ? 'status-empty' : 'status-low'}">
                        ${product.currentstock === 0 ? 'Out of Stock' : 'Low Stock'}
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
                <td>${formatDateShort(transaction.transactiondate)}</td>
                <td>${transaction.productcode} - ${transaction.productname}</td>
                <td>${transaction.warehousename}</td>
                <td>
                    <span class="status-badge transaction-${transaction.transactiontype.toLowerCase()}">
                        ${transaction.transactiontype}
                    </span>
                </td>
                <td>${transaction.quantity}</td>
                <td>${transaction.username}</td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading recent transactions:', error);
        document.getElementById('transactionsTable').innerHTML = 
            '<tr><td colspan="6" class="text-center">Error loading data</td></tr>';
    }
}
