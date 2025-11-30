// ===============================================
// Categories Page Functionality
// ===============================================

document.addEventListener('DOMContentLoaded', () => {
    loadCategories();
    setupSearch('categoriesGrid', 'searchInput');
    
    // Form submission
    document.getElementById('categoryForm').addEventListener('submit', handleCategorySubmit);
});

// Load categories
async function loadCategories() {
    try {
        const categories = await apiGet('/categories');
        displayCategories(categories);
    } catch (error) {
        console.error('Error loading categories:', error);
        document.getElementById('categoriesGrid').innerHTML = 
            '<div style="grid-column: 1/-1; text-align: center;">Error loading categories</div>';
    }
}

// Display categories in grid
function displayCategories(categories) {
    const grid = document.getElementById('categoriesGrid');
    
    if (categories.length === 0) {
        grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center;">No categories found</div>';
        return;
    }
    
    grid.innerHTML = categories.map(category => `
        <div class="category-card">
            <h3>${category.categoryname}</h3>
            <p>${category.description || 'No description'}</p>
            <div class="category-stats">
                <i class="fas fa-box"></i>
                <span>${category.productcount} Products</span>
            </div>
        </div>
    `).join('');
}

// Open add category modal
function openAddCategoryModal() {
    document.getElementById('categoryForm').reset();
    openModal('categoryModal');
}

// Handle category form submission
async function handleCategorySubmit(e) {
    e.preventDefault();
    
    const categoryData = {
        CategoryName: document.getElementById('categoryName').value,
        Description: document.getElementById('categoryDescription').value
    };
    
    try {
        await apiPost('/categories', categoryData);
        showNotification('Category created successfully');
        closeCategoryModal();
        loadCategories();
    } catch (error) {
        console.error('Error creating category:', error);
    }
}

// Close category modal
function closeCategoryModal() {
    closeModal('categoryModal');
    document.getElementById('categoryForm').reset();
}
