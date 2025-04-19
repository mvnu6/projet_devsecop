package com.example.devsecops_projet.service;

import com.example.devsecops_projet.model.Product;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class ProductService {

    // En production, on utiliserait une base de données
    // Pour simplifier, on utilise une HashMap
    private final Map<String, Product> productMap = new HashMap<>();

    public ProductService() {
        // Ajouter quelques produits d'exemple
        Product p1 = new Product(UUID.randomUUID().toString(), "Ordinateur portable", "Ordinateur pour développeurs", 1200.0, 10);
        Product p2 = new Product(UUID.randomUUID().toString(), "Smartphone", "Téléphone haut de gamme", 800.0, 15);
        Product p3 = new Product(UUID.randomUUID().toString(), "Tablette", "Tablette tactile performante", 500.0, 20);

        productMap.put(p1.getId(), p1);
        productMap.put(p2.getId(), p2);
        productMap.put(p3.getId(), p3);
    }

    public List<Product> getAllProducts() {
        return new ArrayList<>(productMap.values());
    }

    public Optional<Product> getProductById(String id) {
        return Optional.ofNullable(productMap.get(id));
    }

    public Product saveProduct(Product product) {
        if (product.getId() == null) {
            product.setId(UUID.randomUUID().toString());
        }
        productMap.put(product.getId(), product);
        return product;
    }

    public void deleteProduct(String id) {
        productMap.remove(id);
    }
}