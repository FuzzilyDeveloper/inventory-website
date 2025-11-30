// ===============================================
// Reports Page Functionality
// ===============================================

document.addEventListener('DOMContentLoaded', () => {
    loadInventoryValueReport();
});

// Tab switching
function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.getElementById(tabName).classList.add('active');
    
    // Load appropriate data
    if (tabName === 'inventory-value') {
        loadInventoryValueReport();
    } else if (tabName === 'category-breakdown') {
        loadCategoryBreakdownReport();
    } else if (tabName === 'transactions') {
        loadTransactionReport();
    }
}

// Load inventory value report
async function loadInventoryValueReport() {
    try {
        const data = await apiGet('/reports/inventory-value');
        const tableBody = document.getElementById('inventoryValueTable');
        
        if (data.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="4" class="text-center">No data available</td></tr>';
            return;
        }
        
        tableBody.innerHTML = data.map(item => `
            <tr>
                <td><strong>${item.WarehouseName}</strong></td>
                <td>${item.UniqueProducts}</td>
                <td>${item.TotalUnits}</td>
                <td class="font-bold text-primary">${formatCurrency(item.TotalValue)}</td>
            </tr>
        `).join('');
        
        // Add total row
        const totalValue = data.reduce((sum, item) => sum + parseFloat(item.TotalValue), 0);
        const totalUnits = data.reduce((sum, item) => sum + parseInt(item.TotalUnits), 0);
        tableBody.innerHTML += `
            <tr style="background-color: var(--bg-secondary); font-weight: 600;">
                <td>TOTAL</td>
                <td>-</td>
                <td>${totalUnits}</td>
                <td class="text-primary">${formatCurrency(totalValue)}</td>
            </tr>
        `;
    } catch (error) {
        console.error('Error loading inventory value report:', error);
        document.getElementById('inventoryValueTable').innerHTML = 
            '<tr><td colspan="4" class="text-center">Error loading report</td></tr>';
    }
}

// Load category breakdown report
async function loadCategoryBreakdownReport() {
    try {
        const data = await apiGet('/reports/category-breakdown');
        const tableBody = document.getElementById('categoryBreakdownTable');
        
        if (data.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="4" class="text-center">No data available</td></tr>';
            return;
        }
        
        tableBody.innerHTML = data.map(item => `
            <tr>
                <td><strong>${item.CategoryName}</strong></td>
                <td>${item.ProductCount}</td>
                <td>${item.TotalUnits}</td>
                <td class="font-bold text-primary">${formatCurrency(item.TotalValue)}</td>
            </tr>
        `).join('');
        
        // Add total row
        const totalValue = data.reduce((sum, item) => sum + parseFloat(item.TotalValue), 0);
        const totalUnits = data.reduce((sum, item) => sum + parseInt(item.TotalUnits), 0);
        const totalProducts = data.reduce((sum, item) => sum + parseInt(item.ProductCount), 0);
        tableBody.innerHTML += `
            <tr style="background-color: var(--bg-secondary); font-weight: 600;">
                <td>TOTAL</td>
                <td>${totalProducts}</td>
                <td>${totalUnits}</td>
                <td class="text-primary">${formatCurrency(totalValue)}</td>
            </tr>
        `;
    } catch (error) {
        console.error('Error loading category breakdown report:', error);
        document.getElementById('categoryBreakdownTable').innerHTML = 
            '<tr><td colspan="4" class="text-center">Error loading report</td></tr>';
    }
}

// Load transaction report
async function loadTransactionReport() {
    try {
        const transactionType = document.getElementById('transactionTypeFilter').value;
        const data = await apiGet(`/reports/transactions?transactionType=${transactionType}`);
        const tableBody = document.getElementById('transactionsReportTable');
        
        if (data.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="9" class="text-center">No transactions found</td></tr>';
            return;
        }
        
        tableBody.innerHTML = data.map(transaction => `
            <tr>
                <td>${formatDate(transaction.TransactionDate)}</td>
                <td>${transaction.ProductCode}</td>
                <td>${transaction.ProductName}</td>
                <td>${transaction.WarehouseName}</td>
                <td>
                    <span class="status-badge transaction-${transaction.TransactionType.toLowerCase()}">
                        ${transaction.TransactionType}
                    </span>
                </td>
                <td>${transaction.Quantity}</td>
                <td>${formatCurrency(transaction.TransactionValue)}</td>
                <td>${transaction.UserName}</td>
                <td>${transaction.Notes || '-'}</td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading transaction report:', error);
        document.getElementById('transactionsReportTable').innerHTML = 
            '<tr><td colspan="9" class="text-center">Error loading report</td></tr>';
    }
}
