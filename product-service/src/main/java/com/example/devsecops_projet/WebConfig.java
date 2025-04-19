package com.example.devsecops_projet;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        // Autoriser toutes les routes pour toutes les origines (modifie cette ligne en fonction de tes besoins)
        registry.addMapping("/**") // Applique CORS à toutes les routes de l'application
                .allowedOrigins("http://localhost:3000")  // Autorise ton frontend (ici sur localhost:3000)
                .allowedMethods("GET", "POST", "PUT", "DELETE")  // Méthodes autorisées
                .allowedHeaders("*")  // Permet tous les headers
                .allowCredentials(true);  // Permet l'envoi de cookies si nécessaire
    }
}