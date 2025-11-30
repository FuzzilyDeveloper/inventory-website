// ===============================================
// Suppliers Page Functionality
// ===============================================

document.addEventListener('DOMContentLoaded', () => {
    loadSuppliers();
    setupSearch('suppliersTable', 'searchInput');
    
    // Form submission
    document.getElementById('supplierForm').addEventListener('submit', handleSupplierSubmit);
});

// Load suppliers
async function loadSuppliers() {
    try {
        const suppliers = await apiGet('/suppliers');
        displaySuppliers(suppliers);
    } catch (error) {
        console.error('Error loading suppliers:', error);
        document.getElementById('suppliersTable').innerHTML = 
            '<tr><td colspan="7" class="text-center">Error loading suppliers</td></tr>';
    }
}

// Display suppliers in table
function displaySuppliers(suppliers) {
    const tableBody = document.getElementById('suppliersTable');
    
    if (suppliers.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" class="text-center">No suppliers found</td></tr>';
        return;
    }
    
    tableBody.innerHTML = suppliers.map(supplier => `
        <tr>
            <td><strong>${supplier.SupplierName}</strong></td>
            <td>${supplier.ContactPerson || 'N/A'}</td>
            <td>${supplier.Email || 'N/A'}</td>
            <td>${supplier.Phone || 'N/A'}</td>
            <td>${supplier.City || 'N/A'}</td>
            <td>${supplier.Country || 'N/A'}</td>
            <td><span class="status-badge status-good">${supplier.ProductCount} Products</span></td>
        </tr>
    `).join('');
}

// Open add supplier modal
function openAddSupplierModal() {
    document.getElementById('supplierForm').reset();
    openModal('supplierModal');
}

// Handle supplier form submission
async function handleSupplierSubmit(e) {
    e.preventDefault();
    
    const supplierData = {
        SupplierName: document.getElementById('supplierName').value,
        ContactPerson: document.getElementById('contactPerson').value,
        Email: document.getElementById('email').value,
        Phone: document.getElementById('phone').value,
        Address: document.getElementById('address').value,
        City: document.getElementById('city').value,
        Country: document.getElementById('country').value
    };
    
    try {
        await apiPost('/suppliers', supplierData);
        showNotification('Supplier created successfully');
        closeSupplierModal();
        loadSuppliers();
    } catch (error) {
        console.error('Error creating supplier:', error);
    }
}

// Close supplier modal
function closeSupplierModal() {
    closeModal('supplierModal');
    document.getElementById('supplierForm').reset();
}
