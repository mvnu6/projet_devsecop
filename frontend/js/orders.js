// Configuration
const PRODUCT_API_URL = 'http://127.0.0.1:8080/products'; // Adresse de votre service Product
const ORDER_API_URL = 'http://localhost:8081/orders';   // Adresse de votre service Order

// Éléments DOM
const ordersTableBody = document.getElementById('orders-table-body');
const loadingElement = document.getElementById('loading-orders');
const errorElement = document.getElementById('error-orders');
const addOrderForm = document.getElementById('add-order-form');
const orderItemsContainer = document.getElementById('order-items');
const addItemButton = document.getElementById('add-item-btn');

// Chargement des commandes
async function loadOrders() {
    try {
        showLoading(true);
        showError(false);
        
        const response = await fetch(`${ORDER_API_URL}/orders`);
        
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        const orders = await response.json();
        displayOrders(orders);
        
    } catch (error) {
        console.error('Erreur lors du chargement des commandes:', error);
        showError(true, `Impossible de charger les commandes: ${error.message}`);
    } finally {
        showLoading(false);
    }
}

// Afficher les commandes dans le tableau
function displayOrders(orders) {
    ordersTableBody.innerHTML = '';
    
    if (orders.length === 0) {
        ordersTableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center">Aucune commande disponible</td>
            </tr>
        `;
        return;
    }
    
    for (const order of orders) {
        const formattedDate = new Date(order.createdAt).toLocaleString();
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${order.id}</td>
            <td>${order.customerName}</td>
            <td>${order.items.length}</td>
            <td>${order.totalAmount.toFixed(2)} €</td>
            <td><span class="badge bg-${getStatusBadgeClass(order.status)}">${order.status}</span></td>
            <td>${formattedDate}</td>
            <td>
                <button class="btn btn-sm btn-outline-info me-1" onclick="viewOrder('${order.id}')">Détails</button>
                <button class="btn btn-sm btn-outline-primary me-1" onclick="updateOrderStatus('${order.id}')">Statut</button>
            </td>
        `;
        ordersTableBody.appendChild(row);
    }
}

// Obtenir la classe de couleur pour le badge de statut
function getStatusBadgeClass(status) {
    switch (status.toUpperCase()) {
        case 'CREATED': return 'secondary';
        case 'PAID': return 'primary';
        case 'SHIPPED': return 'info';
        case 'DELIVERED': return 'success';
        case 'CANCELLED': return 'danger';
        default: return 'secondary';
    }
}

// Chargement des produits pour le formulaire de commande
async function loadProductsForOrderForm() {
    try {
        const response = await fetch(`${PRODUCT_API_URL}/products`);
        
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        const products = await response.json();
        populateProductDropdowns(products);
        
    } catch (error) {
        console.error('Erreur lors du chargement des produits:', error);
        alert(`Impossible de charger les produits: ${error.message}`);
    }
}

// Remplir les listes déroulantes de produits
function populateProductDropdowns(products) {
    const productSelects = document.querySelectorAll('.product-select');
    
    for (const select of productSelects) {
        // Conserver l'option par défaut
        const defaultOption = select.querySelector('option');
        select.innerHTML = '';
        select.appendChild(defaultOption);
        
        // Ajouter les options de produits
        for (const product of products) {
            const option = document.createElement('option');
            option.value = product.id;
            option.textContent = `${product.name} (${product.price.toFixed(2)} €)`;
            option.dataset.price = product.price;
            select.appendChild(option);
        }
    }
}

// Ajouter un champ d'article à la commande
function addOrderItemField() {
    const orderItem = document.createElement('div');
    orderItem.className = 'order-item card mb-3 p-3';
    orderItem.innerHTML = `
        <div class="row g-3">
            <div class="col-md-6">
                <label class="form-label">Produit</label>
                <select class="form-select product-select" required>
                    <option value="">Sélectionner un produit</option>
                </select>
            </div>
            <div class="col-md-4">
                <label class="form-label">Quantité</label>
                <input type="number" class="form-control product-quantity" min="1" value="1" required>
            </div>
            <div class="col-md-2 d-flex align-items-end">
                <button type="button" class="btn btn-danger remove-item">Retirer</button>
            </div>
        </div>
    `;
    
    // Ajouter l'élément à la liste
    orderItemsContainer.appendChild(orderItem);
    
    // Activer le bouton de suppression du premier élément
    document.querySelector('.remove-item[disabled]')?.removeAttribute('disabled');
    
    // Mettre à jour les listes déroulantes de produits
    fetch(`${PRODUCT_API_URL}/products`)
        .then(response => response.json())
        .then(products => {
            const select = orderItem.querySelector('.product-select');
            for (const product of products) {
                const option = document.createElement('option');
                option.value = product.id;
                option.textContent = `${product.name} (${product.price.toFixed(2)} €)`;
                option.dataset.price = product.price;
                select.appendChild(option);
            }
        })
        .catch(error => console.error('Erreur lors du chargement des produits:', error));
    
    // Ajouter le gestionnaire d'événement pour la suppression
    orderItem.querySelector('.remove-item').addEventListener('click', function() {
        orderItem.remove();
        // Désactiver le bouton de suppression s'il ne reste qu'un élément
        if (document.querySelectorAll('.order-item').length === 1) {
            document.querySelector('.remove-item').setAttribute('disabled', '');
        }
    });
}

// Créer une commande
async function createOrder(orderData) {
    try {
        const response = await fetch(`${ORDER_API_URL}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        });
        
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        // Recharger la liste des commandes
        loadOrders();
        
        // Fermer le modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('addOrderModal'));
        modal.hide();
        
    } catch (error) {
        console.error('Erreur lors de la création de la commande:', error);
        alert(`Impossible de créer la commande: ${error.message}`);
    }
}

// Voir les détails d'une commande
async function viewOrder(orderId) {
    try {
        const response = await fetch(`${ORDER_API_URL}/orders/${orderId}`);
        
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        const order = await response.json();
        displayOrderDetails(order);
        
        // Afficher le modal
        const modal = new bootstrap.Modal(document.getElementById('orderDetailsModal'));
        modal.show();
        
    } catch (error) {
        console.error('Erreur lors du chargement des détails de la commande:', error);
        alert(`Impossible de charger les détails de la commande: ${error.message}`);
    }
}

// Afficher les détails d'une commande
function displayOrderDetails(order) {
    const detailsContainer = document.getElementById('order-details-content');
    const formattedDate = new Date(order.createdAt).toLocaleString();
    
    let itemsHtml = '';
    for (const item of order.items) {
        itemsHtml += `
            <tr>
                <td>${item.productName || 'N/A'}</td>
                <td>${item.quantity}</td>
                <td>${item.unitPrice ? item.unitPrice.toFixed(2) + ' €' : 'N/A'}</td>
                <td>${(item.quantity * item.unitPrice).toFixed(2)} €</td>
            </tr>
        `;
    }
    
    detailsContainer.innerHTML = `
        <div class="mb-4">
            <h6>Informations générales</h6>
            <div class="row">
                <div class="col-md-6">
                    <p><strong>ID:</strong> ${order.id}</p>
                    <p><strong>Client:</strong> ${order.customerName}</p>
                </div>
                <div class="col-md-6">
                    <p><strong>Date:</strong> ${formattedDate}</p>
                    <p><strong>Statut:</strong> <span class="badge bg-${getStatusBadgeClass(order.status)}">${order.status}</span></p>
                </div>
            </div>
        </div>
        
        <h6>Articles</h6>
        <div class="table-responsive">
            <table class="table table-striped">
                <thead>
                    <tr>
                        <th>Produit</th>
                        <th>Quantité</th>
                        <th>Prix unitaire</th>
                        <th>Sous-total</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHtml}
                </tbody>
                <tfoot>
                    <tr>
                        <th colspan="3" class="text-end">Total:</th>
                        <th>${order.totalAmount.toFixed(2)} €</th>
                    </tr>
                </tfoot>
            </table>
        </div>
    `;
}

// Mettre à jour le statut d'une commande
async function updateOrderStatus(orderId) {
    const newStatus = prompt('Nouveau statut (CREATED, PAID, SHIPPED, DELIVERED, CANCELLED):');
    
    if (!newStatus) return;
    
    try {
        const response = await fetch(`${ORDER_API_URL}/orders/${orderId}/status?status=${newStatus.toUpperCase()}`, {
            method: 'PUT'
        });
        
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        // Recharger la liste des commandes
        loadOrders();
        
    } catch (error) {
        console.error('Erreur lors de la mise à jour du statut:', error);
        alert(`Impossible de mettre à jour le statut: ${error.message}`);
    }
}

// Utilitaires
function showLoading(isLoading) {
    loadingElement.style.display = isLoading ? 'block' : 'none';
}

function showError(isError, message = 'Erreur lors du chargement des commandes.') {
    errorElement.textContent = message;
    errorElement.classList.toggle('d-none', !isError);
}

// Gestionnaires d'événements
document.addEventListener('DOMContentLoaded', () => {
    // Charger les commandes au chargement de la page
    loadOrders();
    
    // Charger les produits pour le formulaire de commande
    loadProductsForOrderForm();
    
    // Gestionnaire pour le bouton d'ajout d'article
    addItemButton.addEventListener('click', addOrderItemField);
    
    // Gestionnaire pour le formulaire de création de commande
    addOrderForm.addEventListener('submit', (event) => {
        event.preventDefault();
        
        const orderItems = [];
        const itemElements = document.querySelectorAll('.order-item');
        
        for (const element of itemElements) {
            const productSelect = element.querySelector('.product-select');
            const quantityInput = element.querySelector('.product-quantity');
            
            if (productSelect.value) {
                orderItems.push({
                    productId: productSelect.value,
                    quantity: parseInt(quantityInput.value)
                });
            }
        }
        
        const newOrder = {
            customerName: document.getElementById('customer-name').value,
            items: orderItems
        };
        
        createOrder(newOrder);
        addOrderForm.reset();
        
        // Réinitialiser les champs d'articles
        const currentItems = document.querySelectorAll('.order-item');
        for (let i = 1; i < currentItems.length; i++) {
            currentItems[i].remove();
        }
        document.querySelector('.remove-item').setAttribute('disabled', '');
    });
});