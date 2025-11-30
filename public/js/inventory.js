// ===============================================
// Inventory Page Functionality
// ===============================================

let products = [];
let warehouses = [];

document.addEventListener('DOMContentLoaded', () => {
    loadInventory();
    loadProductsForDropdown();
    loadWarehousesForDropdown();
    setupSearch('inventoryTable', 'searchInput');
    
    // Form submission
    document.getElementById('inventoryForm').addEventListener('submit', handleInventorySubmit);
});

// Load inventory data
async function loadInventory() {
    try {
        const inventory = await apiGet('/inventory');
        displayInventory(inventory);
    } catch (error) {
        console.error('Error loading inventory:', error);
        document.getElementById('inventoryTable').innerHTML = 
            '<tr><td colspan="10" class="text-center">Error loading inventory</td></tr>';
    }
}

// Display inventory in table
function displayInventory(inventory) {
    const tableBody = document.getElementById('inventoryTable');
    
    if (inventory.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="10" class="text-center">No inventory records found</td></tr>';
        return;
    }
    
    tableBody.innerHTML = inventory.map(item => {
        const statusClass = item.stockstatus === 'Low' ? 'status-low' : 
                          item.stockstatus === 'Empty' ? 'status-empty' : 'status-good';
        
        return `
            <tr>
                <td>${item.productcode}</td>
                <td><strong>${item.productname}</strong></td>
                <td>${item.categoryname}</td>
                <td>${item.warehousename}</td>
                <td><span class="font-bold">${item.quantity}</span></td>
                <td>${formatCurrency(item.unitprice)}</td>
                <td>${formatCurrency(item.totalvalue)}</td>
                <td>${item.lastrestockdate ? formatDateShort(item.lastrestockdate) : 'N/A'}</td>
                <td><span class="status-badge ${statusClass}">${item.stockstatus}</span></td>
                <td>
                    <button class="btn btn-sm btn-success" onclick="quickAdjust(${item.inventoryid}, 'IN')">
                        <i class="fas fa-plus"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="quickAdjust(${item.inventoryid}, 'OUT')">
                        <i class="fas fa-minus"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// Load products for dropdown
async function loadProductsForDropdown() {
    try {
        products = await apiGet('/products');
        const select = document.getElementById('productSelect');
        select.innerHTML = '<option value="">Select Product</option>' + 
            products.map(prod => `<option value="${prod.productid}">${prod.productcode} - ${prod.productname}</option>`).join('');
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

// Load warehouses for dropdown
async function loadWarehousesForDropdown() {
    try {
        warehouses = await apiGet('/warehouses');
        const select = document.getElementById('warehouseSelect');
        select.innerHTML = '<option value="">Select Warehouse</option>' + 
            warehouses.map(wh => `<option value="${wh.warehouseid}">${wh.warehousename}</option>`).join('');
    } catch (error) {
        console.error('Error loading warehouses:', error);
    }
}

// Open adjust inventory modal
function openAdjustInventoryModal() {
    document.getElementById('inventoryForm').reset();
    openModal('inventoryModal');
}

// Quick adjust inventory (for +/- buttons in table)
async function quickAdjust(inventoryId, type) {
    const quantity = prompt(`Enter quantity to ${type === 'IN' ? 'add' : 'remove'}:`, '10');
    if (!quantity || isNaN(quantity) || parseInt(quantity) <= 0) {
        return;
    }
    
    // This is a simplified version - in production, you'd need to fetch the inventory item first
    // to get ProductID and WarehouseID
    showNotification('Please use the Adjust Inventory button for manual adjustments', 'error');
}

// Handle inventory form submission
async function handleInventorySubmit(e) {
    e.preventDefault();
    
    const inventoryData = {
        ProductID: parseInt(document.getElementById('productSelect').value),
        WarehouseID: parseInt(document.getElementById('warehouseSelect').value),
        TransactionType: document.getElementById('transactionType').value,
        Quantity: parseInt(document.getElementById('quantity').value),
        Notes: document.getElementById('notes').value,
        UserName: 'Admin' // In production, get from logged-in user
    };
    
    try {
        await apiPost('/inventory/adjust', inventoryData);
        showNotification('Inventory adjusted successfully');
        closeInventoryModal();
        loadInventory();
    } catch (error) {
        console.error('Error adjusting inventory:', error);
    }
}

// Close inventory modal
function closeInventoryModal() {
    closeModal('inventoryModal');
    document.getElementById('inventoryForm').reset();
}
