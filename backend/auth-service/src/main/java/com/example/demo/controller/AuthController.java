package com.example.demo.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.http.HttpHeaders;

import com.example.demo.dto.AuthResponse;
import com.example.demo.dto.ChangePasswordRequest;
import com.example.demo.dto.LoginRequest;
import com.example.demo.dto.RegisterRequest;
import com.example.demo.dto.UpdateProfileRequest;
import com.example.demo.dto.UserProfileResponse;
import com.example.demo.service.AuthService;

import org.springframework.beans.factory.annotation.Value;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

	@Value("${jwt.cookie.secure:false}")
	private boolean cookieSecure;

	private final AuthService authService;
	private final com.example.demo.security.LoginAttemptLimiter loginAttemptLimiter;

	public AuthController(AuthService authService, com.example.demo.security.LoginAttemptLimiter loginAttemptLimiter) {
		this.authService = authService;
		this.loginAttemptLimiter = loginAttemptLimiter;
	}

	@GetMapping("/me")
	public ResponseEntity<UserProfileResponse> getCurrentUser() {

		return ResponseEntity.ok(authService.getProfile());
	}

	@PutMapping("/me")
	public ResponseEntity<UserProfileResponse> updateProfile(@Valid @RequestBody UpdateProfileRequest request) {

		return ResponseEntity.ok(authService.updateProfile(request));
	}

	@PutMapping("/change-password")
	public ResponseEntity<String> changePassword(@Valid @RequestBody ChangePasswordRequest request) {

		return ResponseEntity.ok(authService.changePassword(request));
	}

	@PostMapping("/forgot-password")
	public ResponseEntity<String> forgotPassword(@RequestBody java.util.Map<String, String> body, jakarta.servlet.http.HttpServletRequest httpRequest) {
		String email = body != null ? body.get("email") : null;
		if (loginAttemptLimiter.isPasswordResetBlocked(httpRequest, email)) {
			throw new com.example.demo.exception.RateLimitExceededException("Too many password reset requests. Please try again after 15 minutes.");
		}
		try {
			String result = authService.forgotPassword(email);
			loginAttemptLimiter.recordPasswordResetAttempt(httpRequest, email);
			return ResponseEntity.ok(result);
		} catch (Exception e) {
			loginAttemptLimiter.recordPasswordResetAttempt(httpRequest, email);
			throw e;
		}
	}

	@PostMapping("/reset-password")
	public ResponseEntity<String> resetPassword(@Valid @RequestBody com.example.demo.dto.ResetPasswordRequest request) {
		return ResponseEntity.ok(authService.resetPassword(request));
	}

	// REGISTER
	@PostMapping("/register")
	public ResponseEntity<String> register(@Valid @RequestBody RegisterRequest request) {

		authService.register(request);

		return ResponseEntity.status(HttpStatus.CREATED).body("Registration successful");
	}

	// LOGIN
	@PostMapping("/login")
	public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request, jakarta.servlet.http.HttpServletRequest httpRequest) {
		String email = request.getEmail();
		if (loginAttemptLimiter.isBlocked(httpRequest, email)) {
			throw new com.example.demo.exception.RateLimitExceededException("Too many failed login attempts. Please try again after 15 minutes.");
		}

		try {
			AuthResponse response = authService.login(request);
			loginAttemptLimiter.reset(httpRequest, email);

			ResponseCookie cookie = ResponseCookie.from("jwt", response.getToken()).httpOnly(true).secure(cookieSecure)
					.path("/").sameSite("Lax").maxAge(60 * 60 * 24).build();

			return ResponseEntity.ok().header(HttpHeaders.SET_COOKIE, cookie.toString()).body(response);
		} catch (Exception e) {
			loginAttemptLimiter.recordFailure(httpRequest, email);
			throw e;
		}
	}

	// LOGOUT
	@PostMapping("/logout")
	public ResponseEntity<String> logout() {

		ResponseCookie cookie = ResponseCookie.from("jwt", "").httpOnly(true).secure(cookieSecure)
				.path("/").sameSite("Lax").maxAge(0).build();

		return ResponseEntity.ok().header(HttpHeaders.SET_COOKIE, cookie.toString()).body("Logged out successfully");
	}
}