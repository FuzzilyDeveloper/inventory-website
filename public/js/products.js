// ===============================================
// Products Page Functionality
// ===============================================

let categories = [];
let suppliers = [];

document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    loadCategories();
    loadSuppliers();
    setupSearch('productsTable', 'searchInput');
    
    // Form submission
    document.getElementById('productForm').addEventListener('submit', handleProductSubmit);
});

// Load all products
async function loadProducts() {
    try {
        const products = await apiGet('/products');
        displayProducts(products);
    } catch (error) {
        console.error('Error loading products:', error);
        document.getElementById('productsTable').innerHTML = 
            '<tr><td colspan="9" class="text-center">Error loading products</td></tr>';
    }
}

// Display products in table
function displayProducts(products) {
    const tableBody = document.getElementById('productsTable');
    
    if (products.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="9" class="text-center">No products found</td></tr>';
        return;
    }
    
    tableBody.innerHTML = products.map(product => {
        const stockStatus = product.totalstock <= product.reorderlevel ? 'Low Stock' : 'In Stock';
        const statusClass = product.totalstock <= product.reorderlevel ? 'status-low' : 'status-good';
        
        return `
            <tr>
                <td>${product.productcode}</td>
                <td><strong>${product.productname}</strong></td>
                <td>${product.categoryname || 'N/A'}</td>
                <td>${product.suppliername || 'N/A'}</td>
                <td>${formatCurrency(product.unitprice)}</td>
                <td><span class="font-bold">${product.totalstock}</span></td>
                <td>${product.reorderlevel}</td>
                <td><span class="status-badge ${statusClass}">${stockStatus}</span></td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="editProduct(${product.productid})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteProduct(${product.productid}, '${product.productname}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// Load categories for dropdown
async function loadCategories() {
    try {
        categories = await apiGet('/categories');
        const select = document.getElementById('categoryId');
        select.innerHTML = '<option value="">Select Category</option>' + 
            categories.map(cat => `<option value="${cat.categoryid}">${cat.categoryname}</option>`).join('');
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

// Load suppliers for dropdown
async function loadSuppliers() {
    try {
        suppliers = await apiGet('/suppliers');
        const select = document.getElementById('supplierId');
        select.innerHTML = '<option value="">Select Supplier</option>' + 
            suppliers.map(sup => `<option value="${sup.supplierid}">${sup.suppliername}</option>`).join('');
    } catch (error) {
        console.error('Error loading suppliers:', error);
    }
}

// Open add product modal
function openAddProductModal() {
    document.getElementById('modalTitle').textContent = 'Add Product';
    document.getElementById('productForm').reset();
    document.getElementById('productId').value = '';
    document.getElementById('productCode').disabled = false;
    openModal('productModal');
}

// Edit product
async function editProduct(productId) {
    try {
        const product = await apiGet(`/products/${productId}`);
        
        document.getElementById('modalTitle').textContent = 'Edit Product';
        document.getElementById('productId').value = product.productid;
        document.getElementById('productCode').value = product.productcode;
        document.getElementById('productCode').disabled = true;
        document.getElementById('productName').value = product.productname;
        document.getElementById('description').value = product.description || '';
        document.getElementById('categoryId').value = product.categoryid;
        document.getElementById('supplierId').value = product.supplierid;
        document.getElementById('unitPrice').value = product.unitprice;
        document.getElementById('reorderLevel').value = product.reorderlevel;
        
        openModal('productModal');
    } catch (error) {
        console.error('Error loading product:', error);
    }
}

// Delete product
async function deleteProduct(productId, productName) {
    if (!confirm(`Are you sure you want to delete "${productName}"?`)) {
        return;
    }
    
    try {
        await apiDelete(`/products/${productId}`);
        showNotification('Product deleted successfully');
        loadProducts();
    } catch (error) {
        console.error('Error deleting product:', error);
    }
}

// Handle form submission
async function handleProductSubmit(e) {
    e.preventDefault();
    
    const productId = document.getElementById('productId').value;
    const productData = {
        ProductCode: document.getElementById('productCode').value,
        ProductName: document.getElementById('productName').value,
        Description: document.getElementById('description').value,
        CategoryID: parseInt(document.getElementById('categoryId').value),
        SupplierID: parseInt(document.getElementById('supplierId').value),
        UnitPrice: parseFloat(document.getElementById('unitPrice').value),
        ReorderLevel: parseInt(document.getElementById('reorderLevel').value)
    };
    
    try {
        if (productId) {
            // Update existing product
            delete productData.productcode; // Can't update product code
            await apiPut(`/products/${productId}`, productData);
            showNotification('Product updated successfully');
        } else {
            // Create new product
            await apiPost('/products', productData);
            showNotification('Product created successfully');
        }
        
        closeProductModal();
        loadProducts();
    } catch (error) {
        console.error('Error saving product:', error);
    }
}

// Close product modal
function closeProductModal() {
    closeModal('productModal');
    document.getElementById('productForm').reset();
}
