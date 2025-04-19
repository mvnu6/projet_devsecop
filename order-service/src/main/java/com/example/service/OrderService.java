package com.example.service;

import com.example.model.Order;
import com.example.model.OrderItem;
import com.example.model.Product;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class OrderService {

    private final WebClient.Builder webClientBuilder;

    @Value("${product.service.url}")
    private String productServiceUrl;

    private final Map<String, Order> orderMap = new HashMap<>();

    @Autowired
    public OrderService(WebClient.Builder webClientBuilder) {
        this.webClientBuilder = webClientBuilder;
    }

    public List<Order> getAllOrders() {
        return new ArrayList<>(orderMap.values());
    }

    public Optional<Order> getOrderById(String id) {
        return Optional.ofNullable(orderMap.get(id));
    }

    public Order createOrder(Order order) {
        // Générer un ID pour la commande
        order.setId(UUID.randomUUID().toString());

        // Calculer le montant total et récupérer les informations des produits
        double totalAmount = 0;

        for (OrderItem item : order.getItems()) {
            // Récupérer les informations du produit depuis le Product Service
            Product product = retrieveProductInfo(item.getProductId());

            if (product != null) {
                item.setProductName(product.getName());
                item.setUnitPrice(product.getPrice());
                totalAmount += item.getQuantity() * item.getUnitPrice();
            }
        }

        order.setTotalAmount(totalAmount);
        orderMap.put(order.getId(), order);

        return order;
    }

    public Optional<Order> updateOrderStatus(String id, String status) {
        if (orderMap.containsKey(id)) {
            Order order = orderMap.get(id);
            order.setStatus(status);
            return Optional.of(order);
        }
        return Optional.empty();
    }

    private Product retrieveProductInfo(String productId) {
        try {
            return webClientBuilder.build()
                    .get()
                    .uri(productServiceUrl + "/products/" + productId)
                    .retrieve()
                    .bodyToMono(Product.class)
                    .block();
        } catch (Exception e) {
            // En cas d'erreur, on retourne null
            // Dans une application réelle, il faudrait gérer cette erreur correctement
            return null;
        }
    }
}
