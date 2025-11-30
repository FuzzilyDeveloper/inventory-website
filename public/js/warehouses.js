// ===============================================
// Warehouses Page Functionality
// ===============================================

document.addEventListener('DOMContentLoaded', () => {
    loadWarehouses();
    setupSearch('warehousesGrid', 'searchInput');
    
    // Form submission
    document.getElementById('warehouseForm').addEventListener('submit', handleWarehouseSubmit);
});

// Load warehouses
async function loadWarehouses() {
    try {
        const warehouses = await apiGet('/warehouses');
        displayWarehouses(warehouses);
    } catch (error) {
        console.error('Error loading warehouses:', error);
        document.getElementById('warehousesGrid').innerHTML = 
            '<div style="grid-column: 1/-1; text-align: center;">Error loading warehouses</div>';
    }
}

// Display warehouses in grid
function displayWarehouses(warehouses) {
    const grid = document.getElementById('warehousesGrid');
    
    if (warehouses.length === 0) {
        grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center;">No warehouses found</div>';
        return;
    }
    
    grid.innerHTML = warehouses.map(warehouse => `
        <div class="warehouse-card">
            <div class="warehouse-header">
                <div class="warehouse-icon">
                    <i class="fas fa-warehouse"></i>
                </div>
                <div class="warehouse-info">
                    <h3>${warehouse.WarehouseName}</h3>
                    <div class="warehouse-location">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${warehouse.Location || 'Location not specified'}</span>
                    </div>
                </div>
            </div>
            <div class="warehouse-details">
                <div class="warehouse-detail">
                    <div class="warehouse-detail-label">Products</div>
                    <div class="warehouse-detail-value">${warehouse.ProductCount}</div>
                </div>
                <div class="warehouse-detail">
                    <div class="warehouse-detail-label">Total Items</div>
                    <div class="warehouse-detail-value">${warehouse.TotalItems}</div>
                </div>
                <div class="warehouse-detail">
                    <div class="warehouse-detail-label">Capacity</div>
                    <div class="warehouse-detail-value">${warehouse.Capacity || 'N/A'}</div>
                </div>
                <div class="warehouse-detail">
                    <div class="warehouse-detail-label">Manager</div>
                    <div class="warehouse-detail-value" style="font-size: 0.875rem;">${warehouse.ManagerName || 'N/A'}</div>
                </div>
            </div>
        </div>
    `).join('');
}

// Open add warehouse modal
function openAddWarehouseModal() {
    document.getElementById('warehouseForm').reset();
    openModal('warehouseModal');
}

// Handle warehouse form submission
async function handleWarehouseSubmit(e) {
    e.preventDefault();
    
    const warehouseData = {
        WarehouseName: document.getElementById('warehouseName').value,
        Location: document.getElementById('location').value,
        Capacity: parseInt(document.getElementById('capacity').value) || null,
        ManagerName: document.getElementById('managerName').value,
        Phone: document.getElementById('warehousePhone').value
    };
    
    try {
        await apiPost('/warehouses', warehouseData);
        showNotification('Warehouse created successfully');
        closeWarehouseModal();
        loadWarehouses();
    } catch (error) {
        console.error('Error creating warehouse:', error);
    }
}

// Close warehouse modal
function closeWarehouseModal() {
    closeModal('warehouseModal');
    document.getElementById('warehouseForm').reset();
}
