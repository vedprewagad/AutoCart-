package com.example.demo.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.example.demo.entity.Admin;
import com.example.demo.entity.AdminRole;
import com.example.demo.repositories.AdminRepository;

@Component
@Profile({"dev", "default"})
public class AdminInitializer implements CommandLineRunner {

	private static final Logger log = LoggerFactory.getLogger(AdminInitializer.class);

	private final AdminRepository adminRepository;
	private final PasswordEncoder passwordEncoder;

	@Value("${SEED_ADMIN_PASSWORD:admin123}")
	private String adminPassword;

	public AdminInitializer(AdminRepository adminRepository, PasswordEncoder passwordEncoder) {
		this.adminRepository = adminRepository;
		this.passwordEncoder = passwordEncoder;
	}

	@Override
	public void run(String... args) {
		String adminEmail = "admin@autocart.com";

		if (adminRepository.findByEmail(adminEmail).isPresent()) {
			log.info("Admin user already exists ({}); skipping seed initialization to protect existing credentials.", adminEmail);
			return;
		}

		Admin admin = new Admin();
		admin.setEmail(adminEmail);
		admin.setFirstName("System");
		admin.setLastName("Administrator");
		admin.setPasswordHash(passwordEncoder.encode(adminPassword));
		admin.setRole(AdminRole.SUPER_ADMIN);

		adminRepository.save(admin);
		log.info("Default Admin initialized successfully with email: {}", adminEmail);
	}
}
