package com.example.demo.config;

import java.util.Arrays;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

@Component
public class ProductionSecretsValidator implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(ProductionSecretsValidator.class);
    private final Environment env;

    public ProductionSecretsValidator(Environment env) {
        this.env = env;
    }

    @Override
    public void run(String... args) {
        String[] profiles = env.getActiveProfiles();
        boolean isProd = Arrays.stream(profiles).anyMatch(p -> p.equalsIgnoreCase("prod") || p.equalsIgnoreCase("production"));
        if (isProd) {
            validateSecret("SPRING_DATASOURCE_PASSWORD", env.getProperty("spring.datasource.password"));
            validateSecret("MAIL_USERNAME", env.getProperty("spring.mail.username"));
            validateSecret("MAIL_PASSWORD", env.getProperty("spring.mail.password"));
            log.info("Production secrets validation passed successfully for auth-service.");
        } else {
            log.info("Running in non-production profile. Safe local development secret fallbacks active.");
        }
    }

    private void validateSecret(String name, String value) {
        if (value == null || value.trim().isEmpty()) {
            throw new IllegalStateException("CRITICAL CONFIGURATION ERROR: Mandatory secret '" + name + "' is missing in production environment!");
        }
    }
}
