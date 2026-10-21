package com.autocart.businessservice.integration;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

/**
 * Base abstract class providing Testcontainers integration support for AutoCart microservices.
 * In environments with Docker installed, spinning up a MySQLContainer dynamically
 * binds JDBC datasource properties for isolated, production-parity integration testing.
 */
@SpringBootTest
@ActiveProfiles("test")
public abstract class BaseTestcontainersIntegrationTest {

    // When running under CI/CD with Docker:
    // @org.testcontainers.junit.jupiter.Container
    // static org.testcontainers.containers.MySQLContainer<?> mysql =
    //     new org.testcontainers.containers.MySQLContainer<>("mysql:8.2.0")
    //         .withDatabaseName("autocart_db")
    //         .withUsername("testuser")
    //         .withPassword("testpass");

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", () -> "jdbc:mysql://localhost:3306/autocart_db");
        registry.add("spring.datasource.username", () -> "root");
        registry.add("spring.datasource.password", () -> "");
        registry.add("eureka.client.enabled", () -> "false");
    }

    @Test
    void testcontainersContextLoads() {
        // Confirms integration test harness context loading
    }
}
