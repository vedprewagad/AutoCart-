package com.example.demo.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.example.demo.entity.User;
import com.example.demo.entity.Dealer;
import com.example.demo.entity.DealerBrand;
import com.example.demo.entity.Role;
import com.example.demo.entity.UserStatus;
import com.example.demo.entity.DealerStatus;
import com.example.demo.repositories.UserRepository;
import com.example.demo.repositories.DealerRepository;
import com.example.demo.repositories.DealerBrandRepository;

@Component
@Profile({"dev", "default"})
public class DealerInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DealerInitializer.class);

    private final UserRepository userRepository;
    private final DealerRepository dealerRepository;
    private final DealerBrandRepository dealerBrandRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${SEED_DEALER_PASSWORD:dealer123}")
    private String dealerPassword;

    private final org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    public DealerInitializer(
            UserRepository userRepository,
            DealerRepository dealerRepository,
            DealerBrandRepository dealerBrandRepository,
            PasswordEncoder passwordEncoder,
            org.springframework.jdbc.core.JdbcTemplate jdbcTemplate) {
        this.userRepository = userRepository;
        this.dealerRepository = dealerRepository;
        this.dealerBrandRepository = dealerBrandRepository;
        this.passwordEncoder = passwordEncoder;
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) {
        String dealerEmail = "dealer@bubhandari.com";

        if (userRepository.findByEmail(dealerEmail).isPresent()) {
            log.info("Dealer user already exists ({}); skipping seed initialization to protect existing credentials.", dealerEmail);
            return;
        }

        User user = new User();
        user.setEmail(dealerEmail);

        user.setFirstName("BU Bhandari");
        user.setLastName("Motors");
        user.setPasswordHash(passwordEncoder.encode(dealerPassword));
        user.setMobile("9822012345");
        user.setCity("Pune");
        user.setState("Maharashtra");
        user.setRole(Role.DEALER);
        user.setStatus(UserStatus.ACTIVE);

        User savedUser = userRepository.save(user);

        Dealer dealer = dealerRepository.findByUser(savedUser).orElseGet(() -> {
            Dealer newDealer = new Dealer();
            newDealer.setUser(savedUser);
            return newDealer;
        });

        dealer.setShowroomName("B U Bhandari Maruti Suzuki");
        dealer.setGstNumber("27AAACB1234F1Z5");
        dealer.setLicenseNumber("LIC-MB-99881");
        dealer.setAddress("123 Wakdewadi, Pune-Mumbai Highway");
        dealer.setCity("Pune");
        dealer.setState("Maharashtra");
        dealer.setPinCode("411005");
        dealer.setContactPhone("020-25531234");
        dealer.setWorkingHours("09:00 AM - 08:00 PM");
        dealer.setRating(4.8f);
        dealer.setStatus(DealerStatus.APPROVED);

        Dealer savedDealer = dealerRepository.save(dealer);

        if (dealerBrandRepository.findByDealer(savedDealer).isEmpty()) {
            Long marutiBrandId = 1L;
            if (jdbcTemplate != null) {
                try {
                    Long foundId = jdbcTemplate.queryForObject("SELECT id FROM brands WHERE LOWER(name) LIKE '%maruti%' LIMIT 1", Long.class);
                    if (foundId != null) {
                        marutiBrandId = foundId;
                    }
                } catch (Exception ignored) {
                }
            }
            DealerBrand db = new DealerBrand();
            db.setDealer(savedDealer);
            db.setBrandId(marutiBrandId);
            db.setStatus(DealerStatus.APPROVED);
            dealerBrandRepository.save(db);
        }
        log.info("Default Dealer initialized successfully with email: {}", dealerEmail);
    }
}
