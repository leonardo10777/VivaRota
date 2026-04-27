package com.VivaRota.VivaRota_API.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

@Configuration
public class AppConfig {

    @Bean
    public RestTemplate restTemplate() {
        SimpleClientHttpRequestFactory factory =
                new SimpleClientHttpRequestFactory();

        // Tempo máximo para conectar na Mapbox API
        factory.setConnectTimeout(5000);  // 5 segundos

        // Tempo máximo para receber a resposta
        factory.setReadTimeout(10000);    // 10 segundos

        return new RestTemplate(factory);
    }
}