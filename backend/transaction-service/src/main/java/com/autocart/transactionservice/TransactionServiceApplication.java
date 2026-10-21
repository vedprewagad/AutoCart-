package com.autocart.transactionservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.cloud.client.loadbalancer.LoadBalanced;
import org.springframework.context.annotation.Bean;
import org.springframework.web.client.RestTemplate;

@SpringBootApplication
public class TransactionServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(TransactionServiceApplication.class, args);
    }

    @org.springframework.beans.factory.annotation.Value("${internal.api.key:${INTERNAL_API_KEY:autocart-internal-secure-key-2026}}")
    private String internalApiKey;

    @Bean
    @LoadBalanced
    public RestTemplate restTemplate() {
        RestTemplate restTemplate = new RestTemplate();
        restTemplate.getInterceptors().add((request, body, execution) -> {
            if (internalApiKey != null && !internalApiKey.isBlank()) {
                request.getHeaders().add("X-Internal-Token", internalApiKey);
            }
            return execution.execute(request, body);
        });
        return restTemplate;
    }
}
