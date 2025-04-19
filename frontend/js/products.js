// Configuration
const API_URL = 'http://localhost:8080'; // Adresse de votre service Product (à modifier selon votre déploiement)

// Éléments DOM
const productsTableBody = document.getElementById('products-table-body');
const loadingElement = document.getElementById('loading-products');
const errorElement = document.getElementById('error-products');
const addProductForm = document.getElementById('add-product-form');

// Chargement des produits
async function loadProducts() {
    try {
        showLoading(true);
        showError(false);
        
        const response = await fetch(`${API_URL}/products`);
        
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        const products = await response.json();
        displayProducts(products);
        
    } catch (error) {
        console.error('Erreur lors du chargement des produits:', error);
        showError(true, `Impossible de charger les produits: ${error.message}`);
    } finally {
        showLoading(false);
    }
}

// Afficher les produits dans le tableau
function displayProducts(products) {
    productsTableBody.innerHTML = '';
    
    if (products.length === 0) {
        productsTableBody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center">Aucun produit disponible</td>
            </tr>
        `;
        return;
    }
    
    for (const product of products) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.id}</td>
            <td>${product.name}</td>
            <td>${product.description}</td>
            <td>${product.price.toFixed(2)} €</td>
            <td>${product.stockQuantity}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary me-1" onclick="viewProduct('${product.id}')">Voir</button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteProduct('${product.id}')">Supprimer</button>
            </td>
        `;
        productsTableBody.appendChild(row);
    }
}

// Ajouter un nouveau produit
async function addProduct(product) {
    try {
        const response = await fetch(`${API_URL}/products`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(product)
        });
        
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        // Recharger la liste des produits
        loadProducts();
        
        // Fermer le modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('addProductModal'));
        modal.hide();
        
    } catch (error) {
        console.error('Erreur lors de l\'ajout du produit:', error);
        alert(`Impossible d'ajouter le produit: ${error.message}`);
    }
}

// Supprimer un produit
async function deleteProduct(productId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/products/${productId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        // Recharger la liste des produits
        loadProducts();
        
    } catch (error) {
        console.error('Erreur lors de la suppression du produit:', error);
        alert(`Impossible de supprimer le produit: ${error.message}`);
    }
}

// Voir les détails d'un produit
function viewProduct(productId) {
    alert(`Affichage des détails du produit ${productId}`);
    // Implémentation à compléter selon vos besoins
}

// Utilitaires
function showLoading(isLoading) {
    loadingElement.style.display = isLoading ? 'block' : 'none';
}

function showError(isError, message = 'Erreur lors du chargement des produits.') {
    errorElement.textContent = message;
    errorElement.classList.toggle('d-none', !isError);
}

// Gestionnaires d'événements
document.addEventListener('DOMContentLoaded', () => {
    // Charger les produits au chargement de la page
    loadProducts();
    
    // Gestionnaire pour le formulaire d'ajout
    addProductForm.addEventListener('submit', (event) => {
        event.preventDefault();
        
        const newProduct = {
            name: document.getElementById('product-name').value,
            description: document.getElementById('product-description').value,
            price: parseFloat(document.getElementById('product-price').value),
            stockQuantity: parseInt(document.getElementById('product-stock').value)
        };
        
        addProduct(newProduct);
        addProductForm.reset();
    });
});