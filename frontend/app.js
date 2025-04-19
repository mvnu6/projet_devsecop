// Configuration pour les URL d'API
const API_CONFIG = {
    PRODUCTS_API: 'api/products',
    ORDERS_API: 'api/orders'
  };
  
  // Fonctions pour les produits
  const ProductService = {
    // Récupérer tous les produits
    getAllProducts: async () => {
      try {
        const response = await fetch(API_CONFIG.PRODUCTS_API);
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
        return await response.json();
      } catch (error) {
        console.error('Erreur lors de la récupération des produits:', error);
        return [];
      }
    },
    
    // Récupérer un produit par ID
    getProductById: async (productId) => {
      try {
        const response = await fetch(`${API_CONFIG.PRODUCTS_API}/${productId}`);
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
        return await response.json();
      } catch (error) {
        console.error(`Erreur lors de la récupération du produit ${productId}:`, error);
        return null;
      }
    },
    
    // Ajouter un nouveau produit
    addProduct: async (productData) => {
      try {
        const response = await fetch(API_CONFIG.PRODUCTS_API, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(productData)
        });
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
        return await response.json();
      } catch (error) {
        console.error('Erreur lors de l\'ajout du produit:', error);
        return null;
      }
    }
  };
  
  // Fonctions pour les commandes
  const OrderService = {
    // Récupérer toutes les commandes
    getAllOrders: async () => {
      try {
        const response = await fetch(API_CONFIG.ORDERS_API);
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
        return await response.json();
      } catch (error) {
        console.error('Erreur lors de la récupération des commandes:', error);
        return [];
      }
    },
    
    // Récupérer une commande par ID
    getOrderById: async (orderId) => {
      try {
        const response = await fetch(`${API_CONFIG.ORDERS_API}/${orderId}`);
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
        return await response.json();
      } catch (error) {
        console.error(`Erreur lors de la récupération de la commande ${orderId}:`, error);
        return null;
      }
    },
    
    // Créer une nouvelle commande
    createOrder: async (orderData) => {
      try {
        const response = await fetch(API_CONFIG.ORDERS_API, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(orderData)
        });
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
        return await response.json();
      } catch (error) {
        console.error('Erreur lors de la création de la commande:', error);
        return null;
      }
    }
  };
  
  // Fonctions pour manipuler le DOM et afficher les données
  document.addEventListener('DOMContentLoaded', () => {
    // Charger les produits au chargement de la page
    loadProducts();
    
    // Ajouter les écouteurs d'événements pour les formulaires
    const productForm = document.getElementById('product-form');
    if (productForm) {
      productForm.addEventListener('submit', handleProductFormSubmit);
    }
    
    const orderForm = document.getElementById('order-form');
    if (orderForm) {
      orderForm.addEventListener('submit', handleOrderFormSubmit);
    }
  });
  
  // Fonction pour charger et afficher les produits
  async function loadProducts() {
    const productList = document.getElementById('product-list');
    if (!productList) return;
    
    // Afficher un message de chargement
    productList.innerHTML = '<p>Chargement des produits...</p>';
    
    // Récupérer les produits
    const products = await ProductService.getAllProducts();
    
    // Vérifier si des produits ont été récupérés
    if (products.length === 0) {
      productList.innerHTML = '<p>Aucun produit disponible</p>';
      return;
    }
    
    // Générer le HTML pour chaque produit
    const productsHTML = products.map(product => `
      <div class="product-card" data-id="${product.id}">
        <h3>${product.name}</h3>
        <p>${product.description}</p>
        <p class="price">${product.price} €</p>
        <button class="add-to-cart-btn" data-id="${product.id}">Ajouter au panier</button>
      </div>
    `).join('');
    
    // Mettre à jour le DOM
    productList.innerHTML = productsHTML;
    
    // Ajouter des écouteurs pour les boutons "Ajouter au panier"
    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
      button.addEventListener('click', handleAddToCart);
    });
  }
  
  // Fonction pour gérer l'ajout d'un produit au panier
  function handleAddToCart(event) {
    const productId = event.target.getAttribute('data-id');
    // Récupérer le produit depuis l'API
    ProductService.getProductById(productId)
      .then(product => {
        if (!product) return;
        
        // Ajouter le produit au panier (local storage)
        let cart = JSON.parse(localStorage.getItem('cart') || '[]');
        
        // Vérifier si le produit existe déjà dans le panier
        const existingItem = cart.find(item => item.id === product.id);
        
        if (existingItem) {
          existingItem.quantity += 1;
        } else {
          cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1
          });
        }
        
        // Sauvegarder le panier mis à jour
        localStorage.setItem('cart', JSON.stringify(cart));
        
        // Notifier l'utilisateur
        alert(`${product.name} a été ajouté au panier !`);
        
        // Mettre à jour l'affichage du panier
        updateCartDisplay();
      });
  }
  
  // Fonction pour mettre à jour l'affichage du panier
  function updateCartDisplay() {
    const cartItems = document.getElementById('cart-items');
    if (!cartItems) return;
    
    // Récupérer le panier depuis le localStorage
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    // Vérifier si le panier est vide
    if (cart.length === 0) {
      cartItems.innerHTML = '<p>Votre panier est vide</p>';
      return;
    }
    
    // Générer le HTML pour chaque élément du panier
    const cartHTML = cart.map(item => `
      <div class="cart-item">
        <span>${item.name}</span>
        <span>Quantité: ${item.quantity}</span>
        <span>${item.price} €</span>
        <span>Total: ${(item.price * item.quantity).toFixed(2)} €</span>
        <button class="remove-from-cart-btn" data-id="${item.id}">Supprimer</button>
      </div>
    `).join('');
    
    // Calculer le total du panier
    const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
    
    // Mettre à jour le DOM
    cartItems.innerHTML = `
      ${cartHTML}
      <div class="cart-total">
        <strong>Total: ${cartTotal} €</strong>
        <button id="checkout-btn">Commander</button>
      </div>
    `;
    
    // Ajouter des écouteurs pour les boutons "Supprimer"
    document.querySelectorAll('.remove-from-cart-btn').forEach(button => {
      button.addEventListener('click', handleRemoveFromCart);
    });
    
    // Ajouter un écouteur pour le bouton "Commander"
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', handleCheckout);
    }
  }
  
  // Fonction pour gérer la suppression d'un produit du panier
  function handleRemoveFromCart(event) {
    const productId = event.target.getAttribute('data-id');
    
    // Récupérer le panier depuis le localStorage
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    // Filtrer le panier pour supprimer l'élément
    cart = cart.filter(item => item.id !== productId);
    
    // Sauvegarder le panier mis à jour
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Mettre à jour l'affichage du panier
    updateCartDisplay();
  }
  
  // Fonction pour gérer la validation de la commande
  async function handleCheckout() {
    // Récupérer le panier depuis le localStorage
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    if (cart.length === 0) {
      alert('Votre panier est vide');
      return;
    }
    
    // Préparer les données de la commande
    const orderData = {
      items: cart,
      totalAmount: cart.reduce((total, item) => total + (item.price * item.quantity), 0),
      orderDate: new Date().toISOString(),
      // Vous pourriez ajouter des informations sur le client ici
      customer: {
        // Ces données pourraient venir d'un formulaire
        name: "Client Test",
        email: "client@example.com",
        address: "123 Rue Test, 75000 Paris"
      }
    };
    
    // Envoyer la commande au serveur
    const createdOrder = await OrderService.createOrder(orderData);
    
    if (createdOrder) {
      // Vider le panier
      localStorage.removeItem('cart');
      
      // Afficher un message de confirmation
      alert(`Votre commande #${createdOrder.id} a été créée avec succès !`);
      
      // Mettre à jour l'affichage du panier
      updateCartDisplay();
    } else {
      alert('Une erreur est survenue lors de la création de la commande.');
    }
  }
  
  // Fonction pour gérer la soumission du formulaire de produit
  function handleProductFormSubmit(event) {
    event.preventDefault();
    
    // Récupérer les données du formulaire
    const productData = {
      name: document.getElementById('product-name').value,
      description: document.getElementById('product-description').value,
      price: parseFloat(document.getElementById('product-price').value)
    };
    
    // Valider les données
    if (!productData.name || !productData.description || isNaN(productData.price)) {
      alert('Veuillez remplir tous les champs correctement');
      return;
    }
    
    // Envoyer les données au serveur
    ProductService.addProduct(productData)
      .then(createdProduct => {
        if (createdProduct) {
          alert('Produit ajouté avec succès !');
          // Réinitialiser le formulaire
          document.getElementById('product-form').reset();
          // Recharger la liste des produits
          loadProducts();
        } else {
          alert('Une erreur est survenue lors de l\'ajout du produit.');
        }
      });
  }
  
  // Fonction pour gérer la soumission du formulaire de commande
  function handleOrderFormSubmit(event) {
    event.preventDefault();
    
    // Cette fonction pourrait être utilisée pour créer une commande directement depuis un formulaire
    // plutôt que depuis le panier
  }
  
  // Initialiser l'affichage du panier au chargement de la page
  updateCartDisplay();