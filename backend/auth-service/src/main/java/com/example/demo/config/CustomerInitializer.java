package com.example.demo.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.example.demo.entity.User;
import com.example.demo.entity.Role;
import com.example.demo.entity.UserStatus;
import com.example.demo.repositories.UserRepository;

@Component
@Profile({"dev", "default"})
public class CustomerInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(CustomerInitializer.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${SEED_CUSTOMER_PASSWORD:buyer123}")
    private String customerPassword;

    public CustomerInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        String email = "john.doe@example.com";

        if (userRepository.findByEmail(email).isPresent()) {
            log.info("Customer user already exists ({}); skipping seed initialization to protect existing credentials.", email);
            return;
        }

        User user = new User();
        user.setEmail(email);

        user.setFirstName("John");
        user.setLastName("Doe");
        user.setPasswordHash(passwordEncoder.encode(customerPassword));
        user.setMobile("9876543210");
        user.setCity("Mumbai");
        user.setState("Maharashtra");
        user.setRole(Role.CUSTOMER);
        user.setStatus(UserStatus.ACTIVE);

        userRepository.save(user);
        log.info("Default Customer initialized successfully with email: {}", email);
    }
}
