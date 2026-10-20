package com.example.demo.service;

import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.demo.dto.AdminLoginRequest;
import com.example.demo.dto.AuthResponse;
import com.example.demo.entity.Admin;
import com.example.demo.repositories.AdminRepository;
import com.example.demo.security.JwtService;

@Service
public class AdminAuthService {

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AdminAuthService(AdminRepository adminRepository,
                            PasswordEncoder passwordEncoder,
                            JwtService jwtService) {
        this.adminRepository = adminRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public AuthResponse login(AdminLoginRequest request) {

        String email = request.getEmail().trim().toLowerCase();

        Admin admin = adminRepository.findByEmail(email)
                .orElseThrow(() ->
                        new BadCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(),
                admin.getPasswordHash())) {

            throw new BadCredentialsException("Invalid email or password");
        }

        String token = jwtService.generateAdminToken(admin);

        return new AuthResponse(token, admin.getId(), null, admin.getFirstName(), admin.getLastName(), admin.getEmail(), admin.getRole().name(), "ACTIVE");
    }
}