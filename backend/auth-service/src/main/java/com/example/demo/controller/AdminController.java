package com.example.demo.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import com.example.demo.dto.AdminLoginRequest;
import com.example.demo.dto.AuthResponse;
import com.example.demo.service.AdminAuthService;

import jakarta.validation.Valid;

import com.example.demo.dto.DealerDetailResponse;
import com.example.demo.dto.DealerStatusRequest;
import com.example.demo.service.AuthService;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
@Validated
public class AdminController {

    @Value("${jwt.cookie.secure:false}")
    private boolean cookieSecure;

    private final AdminAuthService adminAuthService;
    private final AuthService authService;

    public AdminController(AdminAuthService adminAuthService, AuthService authService) {
        this.adminAuthService = adminAuthService;
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody AdminLoginRequest request) {

        AuthResponse response = adminAuthService.login(request);

        ResponseCookie cookie = ResponseCookie.from("jwt", response.getToken())
                .httpOnly(true)
                .secure(cookieSecure)
                .path("/")
                .sameSite("Lax")
                .maxAge(60 * 60 * 24)
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(response);
    }

    @GetMapping("/dealers/pending")
    public ResponseEntity<List<DealerDetailResponse>> getPendingDealers() {
        return ResponseEntity.ok(authService.getPendingDealers());
    }

    @GetMapping("/dealers")
    public ResponseEntity<List<DealerDetailResponse>> getAllDealers() {
        return ResponseEntity.ok(authService.getAllDealers());
    }

    @PutMapping("/dealers/{dealerId}/status")
    public ResponseEntity<String> updateDealerStatus(
            @PathVariable Long dealerId,
            @RequestBody DealerStatusRequest request) {
        return ResponseEntity.ok(authService.updateDealerStatus(dealerId, request));
    }
}