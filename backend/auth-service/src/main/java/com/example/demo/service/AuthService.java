package com.example.demo.service;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import com.example.demo.dto.DealerProfileResponse;
import com.example.demo.dto.UpdateProfileRequest;
import com.example.demo.dto.ChangePasswordRequest;

import com.example.demo.dto.AuthResponse;
import com.example.demo.dto.LoginRequest;
import com.example.demo.dto.RegisterRequest;
import com.example.demo.dto.UserProfileResponse;
import com.example.demo.dto.UserResponse;
import com.example.demo.entity.Dealer;
import com.example.demo.entity.Role;
import com.example.demo.entity.User;
import com.example.demo.entity.UserStatus;
import com.example.demo.entity.DealerStatus;
import com.example.demo.exception.EmailAlreadyExistsException;
import java.util.Optional;
import com.example.demo.entity.Admin;
import com.example.demo.repositories.AdminRepository;
import com.example.demo.repositories.DealerRepository;
import com.example.demo.repositories.DealerBrandRepository;
import com.example.demo.repositories.UserRepository;
import com.example.demo.security.CustomUserDetailsService;
import com.example.demo.security.JwtService;
import com.example.demo.entity.DealerBrand;
import com.example.demo.dto.DealerDetailResponse;
import com.example.demo.dto.DealerStatusRequest;
import java.util.List;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import com.example.demo.dto.ResetPasswordRequest;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class AuthService {

	private static final Logger log = LoggerFactory.getLogger(AuthService.class);

	@Value("${app.frontend.url:http://localhost:5173}")
	private String frontendUrl;

	@Value("${spring.mail.username:}")
	private String mailUsername;

	@Value("${spring.mail.password:}")
	private String mailPassword;

	@jakarta.annotation.PostConstruct
	public void checkMailConfig() {
		boolean uLoaded = mailUsername != null && !mailUsername.isBlank();
		boolean pLoaded = mailPassword != null && !mailPassword.isBlank();
		log.info("[MAIL CONFIG] spring.mail.username loaded: {}, spring.mail.password loaded: {}", uLoaded, pLoaded);
	}

	private final UserRepository userRepository;
	private final AdminRepository adminRepository;
	private final PasswordEncoder passwordEncoder;
	private final AuthenticationManager authenticationManager;
	private final CustomUserDetailsService userDetailsService;
	private final JwtService jwtService;
	private final DealerRepository dealerRepository;
	private final DealerBrandRepository dealerBrandRepository;

	@Autowired(required = false)
	private JavaMailSender mailSender;

	public AuthService(UserRepository userRepository, AdminRepository adminRepository, PasswordEncoder passwordEncoder,
			AuthenticationManager authenticationManager, CustomUserDetailsService userDetailsService,
			JwtService jwtService, DealerRepository dealerRepository, DealerBrandRepository dealerBrandRepository) {

		this.userRepository = userRepository;
		this.adminRepository = adminRepository;
		this.passwordEncoder = passwordEncoder;
		this.authenticationManager = authenticationManager;
		this.userDetailsService = userDetailsService;
		this.jwtService = jwtService;
		this.dealerRepository = dealerRepository;
		this.dealerBrandRepository = dealerBrandRepository;
	}

	// REGISTER
	@Transactional
	public String register(RegisterRequest request) {

		// 1. Prevent public ADMIN registration
		if (request.getRole() == Role.ADMIN) {
			throw new IllegalArgumentException("Admin registration is not allowed");
		}

		// 2. Normalize email before duplicate check
		String email = request.getEmail().trim().toLowerCase();

		// 3. Check duplicate email and mobile
		if (userRepository.existsByEmail(email)) {
			throw new EmailAlreadyExistsException("Email already registered");
		}

		String mobile = request.getMobile().trim();
		if (userRepository.existsByMobile(mobile)) {
			throw new IllegalArgumentException("Mobile number already registered");
		}

		// 4. Validate dealer-specific information
		if (request.getRole() == Role.DEALER) {

			if (request.getShowroomName() == null || request.getShowroomName().isBlank()) {

				throw new IllegalArgumentException("Showroom name is required for dealer");
			}

			if (request.getGstNumber() == null || request.getGstNumber().isBlank()) {

				throw new IllegalArgumentException("GST number is required for dealer");
			}

			if (request.getLicenseNumber() == null || request.getLicenseNumber().isBlank()) {

				throw new IllegalArgumentException("License number is required for dealer");
			}

			// Normalize dealer values before checking duplicates
			String gstNumber = request.getGstNumber().trim().toUpperCase();

			if (gstNumber.length() != 15) {
				throw new IllegalArgumentException("GST number must be exactly 15 characters");
			}

			String licenseNumber = request.getLicenseNumber().trim().toUpperCase();

			if (licenseNumber.length() < 9 || licenseNumber.length() > 11) {

				throw new IllegalArgumentException("License number must be between 9 and 11 characters");
			}

			if (dealerRepository.existsByLicenseNumber(licenseNumber)) {

				throw new IllegalArgumentException("License number already registered");
			}

			if (dealerRepository.existsByGstNumber(gstNumber)) {
				throw new IllegalArgumentException("GST number already registered");
			}
		}

		// 5. Create common user
		User user = new User();

		user.setFirstName(request.getFirstName().trim());

		user.setLastName(request.getLastName().trim());

		user.setEmail(email);

		user.setPasswordHash(passwordEncoder.encode(request.getPassword()));

		user.setMobile(request.getMobile().trim());

		user.setCity(request.getCity().trim());

		user.setState(request.getState().trim());

		user.setRole(request.getRole());

		user.setStatus(UserStatus.ACTIVE);

		User savedUser = userRepository.save(user);

		// 6. Create dealer profile only for DEALER
		if (request.getRole() == Role.DEALER) {

			Dealer dealer = new Dealer();

			dealer.setUser(savedUser);

			dealer.setShowroomName(request.getShowroomName().trim());

			dealer.setGstNumber(request.getGstNumber().trim().toUpperCase());

			dealer.setLicenseNumber(request.getLicenseNumber().trim().toUpperCase());

			dealer.setAddress(request.getAddress());

			dealer.setCity(request.getCity());

			dealer.setState(request.getState());

			dealer.setPinCode(request.getPinCode());

			dealer.setContactPhone(request.getContactPhone());

			dealer.setWorkingHours(request.getWorkingHours());

			dealer.setRating(0.0f);

			dealer.setStatus(DealerStatus.PENDING);

			Dealer savedDealer = dealerRepository.save(dealer);

			if (request.getBrandId() != null) {
				DealerBrand dealerBrand = new DealerBrand();
				dealerBrand.setDealer(savedDealer);
				dealerBrand.setBrandId(request.getBrandId());
				dealerBrand.setAuthCertUrl(request.getDocUrl());
				dealerBrand.setStatus(DealerStatus.PENDING);
				dealerBrandRepository.save(dealerBrand);
			}
		}

		return "Registration successful";
	}

	public List<DealerDetailResponse> getPendingDealers() {
		return dealerRepository.findByStatus(DealerStatus.PENDING).stream().map(dealer -> {
			DealerDetailResponse dto = new DealerDetailResponse();
			dto.setId(dealer.getId());
			dto.setUserId(dealer.getUser().getId());
			dto.setFirstName(dealer.getUser().getFirstName());
			dto.setLastName(dealer.getUser().getLastName());
			dto.setEmail(dealer.getUser().getEmail());
			dto.setMobile(dealer.getUser().getMobile());
			dto.setShowroomName(dealer.getShowroomName());
			dto.setLicenseNumber(dealer.getLicenseNumber());
			dto.setGstNumber(dealer.getGstNumber());
			dto.setAddress(dealer.getAddress());
			dto.setCity(dealer.getCity());
			dto.setState(dealer.getState());
			dto.setPinCode(dealer.getPinCode());
			dto.setContactPhone(dealer.getContactPhone());
			dto.setWorkingHours(dealer.getWorkingHours());
			dto.setStatus(dealer.getStatus().name());
			dto.setRating(dealer.getRating());

			List<DealerBrand> dbList = dealerBrandRepository.findByDealer(dealer);
			if (!dbList.isEmpty()) {
				dto.setBrandId(dbList.get(0).getBrandId());
			}
			return dto;
		}).collect(Collectors.toList());
	}

	public List<DealerDetailResponse> getAllDealers() {
		return dealerRepository.findAll().stream().map(dealer -> {
			DealerDetailResponse dto = new DealerDetailResponse();
			dto.setId(dealer.getId());
			dto.setUserId(dealer.getUser().getId());
			dto.setFirstName(dealer.getUser().getFirstName());
			dto.setLastName(dealer.getUser().getLastName());
			dto.setEmail(dealer.getUser().getEmail());
			dto.setMobile(dealer.getUser().getMobile());
			dto.setShowroomName(dealer.getShowroomName());
			dto.setLicenseNumber(dealer.getLicenseNumber());
			dto.setGstNumber(dealer.getGstNumber());
			dto.setAddress(dealer.getAddress());
			dto.setCity(dealer.getCity());
			dto.setState(dealer.getState());
			dto.setPinCode(dealer.getPinCode());
			dto.setContactPhone(dealer.getContactPhone());
			dto.setWorkingHours(dealer.getWorkingHours());
			dto.setStatus(dealer.getStatus().name());
			dto.setRating(dealer.getRating());

			List<DealerBrand> dbList = dealerBrandRepository.findByDealer(dealer);
			if (!dbList.isEmpty()) {
				dto.setBrandId(dbList.get(0).getBrandId());
			}
			return dto;
		}).collect(Collectors.toList());
	}

	@Transactional
	public String updateDealerStatus(Long dealerId, DealerStatusRequest request) {
		Dealer dealer = dealerRepository.findById(dealerId)
				.orElseThrow(() -> new RuntimeException("Dealer not found with id: " + dealerId));

		if (request == null || request.getStatus() == null || request.getStatus().trim().isEmpty()) {
			throw new IllegalArgumentException("Dealer status is required");
		}

		DealerStatus newStatus;
		try {
			newStatus = DealerStatus.valueOf(request.getStatus().trim().toUpperCase());
		} catch (IllegalArgumentException e) {
			throw new IllegalArgumentException("Invalid dealer status: '" + request.getStatus() + "'. Allowed statuses are: " + java.util.Arrays.toString(DealerStatus.values()));
		}

		dealer.setStatus(newStatus);
		dealerRepository.save(dealer);

		List<DealerBrand> dbList = dealerBrandRepository.findByDealer(dealer);
		for (DealerBrand db : dbList) {
			db.setStatus(newStatus);
			dealerBrandRepository.save(db);
		}

		return "Dealer status updated to " + newStatus.name();
	}

	// LOGIN
	public AuthResponse login(LoginRequest request) {

		String email = request.getEmail().trim().toLowerCase();

		authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(email, request.getPassword()));

		Optional<User> userOpt = userRepository.findByEmail(email);
		if (userOpt.isPresent()) {
			User user = userOpt.get();
			Long dealerId = null;
			String status = user.getStatus().name();
			String showroomName = null;
			String gstNumber = null;
			String licenseNumber = null;

			if (user.getRole() == Role.DEALER) {
				Dealer dealer = dealerRepository.findByUser(user)
						.orElseThrow(() -> new RuntimeException("Dealer profile not found"));
				if (dealer.getStatus() != DealerStatus.APPROVED) {
					throw new IllegalStateException(
							"Dealer account status is " + dealer.getStatus().name().toLowerCase() + " and cannot log in yet");
				}
				dealerId = dealer.getId();
				status = dealer.getStatus().name();
				showroomName = dealer.getShowroomName();
				gstNumber = dealer.getGstNumber();
				licenseNumber = dealer.getLicenseNumber();
			}
			String token = jwtService.generateToken(user);
			AuthResponse authResp = new AuthResponse(token, user.getId(), dealerId, user.getFirstName(), user.getLastName(), user.getEmail(),
					user.getRole().name(), status);
			authResp.setShowroomName(showroomName);
			authResp.setGstNumber(gstNumber);
			authResp.setLicenseNumber(licenseNumber);
			return authResp;
		}

		Optional<Admin> adminOpt = adminRepository.findByEmail(email);
		if (adminOpt.isPresent()) {
			Admin admin = adminOpt.get();
			String token = jwtService.generateAdminToken(admin);
			return new AuthResponse(token, admin.getId(), null, admin.getFirstName(), admin.getLastName(), admin.getEmail(),
					admin.getRole().name(), "ACTIVE");
		}

		throw new RuntimeException("User not found");
	}
	
	public UserProfileResponse getProfile() {

	    Authentication authentication = SecurityContextHolder
	            .getContext()
	            .getAuthentication();

	    String email = authentication.getName();

	    Optional<User> userOpt = userRepository.findByEmail(email);
	    if (userOpt.isPresent()) {
	        User user = userOpt.get();

	        if (user.getRole() != Role.DEALER) {
	            UserProfileResponse response = new UserProfileResponse();
	            response.setId(user.getId());
	            response.setFirstName(user.getFirstName());
	            response.setLastName(user.getLastName());
	            response.setEmail(user.getEmail());
	            response.setMobile(user.getMobile());
	            response.setCity(user.getCity());
	            response.setState(user.getState());
	            response.setRole(user.getRole().name());
	            response.setStatus(user.getStatus().name());
	            // Re-generate token so frontend can rehydrate Redux state on page refresh
	            response.setToken(jwtService.generateToken(user));
	            return response;
	        }

	        Dealer dealer = dealerRepository.findByUser(user)
	                .orElseThrow(() -> new RuntimeException("Dealer profile not found"));

	        DealerProfileResponse response = new DealerProfileResponse();
	        response.setId(user.getId());
	        response.setDealerId(dealer.getId());
	        response.setFirstName(user.getFirstName());
	        response.setLastName(user.getLastName());
	        response.setEmail(user.getEmail());
	        response.setMobile(user.getMobile());
	        response.setCity(user.getCity());
	        response.setState(user.getState());
	        response.setRole(user.getRole().name());
	        response.setStatus(dealer.getStatus().name());
	        response.setShowroomName(dealer.getShowroomName());
	        response.setGstNumber(dealer.getGstNumber());
	        response.setLicenseNumber(dealer.getLicenseNumber());
	        response.setAddress(dealer.getAddress());
	        response.setPinCode(dealer.getPinCode());
	        response.setContactPhone(dealer.getContactPhone());
	        response.setWorkingHours(dealer.getWorkingHours());
	        response.setRating(dealer.getRating());
	        // Re-generate token so frontend can rehydrate Redux state on page refresh
	        response.setToken(jwtService.generateToken(user));
	        return response;
	    }

	    Optional<Admin> adminOpt = adminRepository.findByEmail(email);
	    if (adminOpt.isPresent()) {
	        Admin admin = adminOpt.get();
	        UserProfileResponse response = new UserProfileResponse();
	        response.setId(admin.getId());
	        response.setFirstName(admin.getFirstName());
	        response.setLastName(admin.getLastName());
	        response.setEmail(admin.getEmail());
	        response.setRole(admin.getRole().name());
	        // Re-generate token so frontend can rehydrate Redux state on page refresh
	        response.setToken(jwtService.generateAdminToken(admin));
	        return response;
	    }

	    throw new RuntimeException("User not found");
	}
	
	@Transactional
	public UserProfileResponse updateProfile(UpdateProfileRequest request) {

	    Authentication authentication = SecurityContextHolder
	            .getContext()
	            .getAuthentication();

	    String email = authentication.getName();

	    User user = userRepository.findByEmail(email)
	            .orElseThrow(() -> new RuntimeException("User not found"));

	    // Update common user fields
	    user.setFirstName(request.getFirstName().trim());
	    user.setLastName(request.getLastName().trim());
	    user.setMobile(request.getMobile().trim());
	    user.setCity(request.getCity().trim());
	    user.setState(request.getState().trim());

	    userRepository.save(user);

	    // Update dealer details if user is a dealer
	    if (user.getRole() == Role.DEALER) {

	        Dealer dealer = dealerRepository.findByUser(user)
	                .orElseThrow(() -> new RuntimeException("Dealer profile not found"));

	        dealer.setShowroomName(request.getShowroomName() != null
	                ? request.getShowroomName().trim()
	                : null);

	        dealer.setAddress(request.getAddress() != null
	                ? request.getAddress().trim()
	                : null);

	        dealer.setPinCode(request.getPinCode() != null
	                ? request.getPinCode().trim()
	                : null);

	        dealer.setContactPhone(request.getContactPhone() != null
	                ? request.getContactPhone().trim()
	                : null);

	        dealer.setWorkingHours(request.getWorkingHours() != null
	                ? request.getWorkingHours().trim()
	                : null);

	        dealerRepository.save(dealer);
	    }

	    // Return updated profile
	    return getProfile();
	}
	
	@Transactional
	public String changePassword(ChangePasswordRequest request) {

	    Authentication authentication = SecurityContextHolder
	            .getContext()
	            .getAuthentication();

	    String email = authentication.getName();

	    User user = userRepository.findByEmail(email)
	            .orElseThrow(() -> new RuntimeException("User not found"));

	    // Verify current password
	    if (!passwordEncoder.matches(request.getCurrentPassword(),
	            user.getPasswordHash())) {

	        throw new IllegalArgumentException("Current password is incorrect");
	    }

	    // Verify new password confirmation
	    if (!request.getNewPassword()
	            .equals(request.getConfirmPassword())) {

	        throw new IllegalArgumentException("Passwords do not match");
	    }

	    // Prevent same password reuse
	    if (passwordEncoder.matches(request.getNewPassword(),
	            user.getPasswordHash())) {

	        throw new IllegalArgumentException(
	                "New password must be different from current password");
	    }

	    user.setPasswordHash(
	            passwordEncoder.encode(request.getNewPassword()));

	    userRepository.save(user);

	    return "Password changed successfully";
	}

	public String forgotPassword(String email) {
		if (email == null || email.isBlank()) {
			throw new IllegalArgumentException("Email is required");
		}
		String targetEmail = email.trim().toLowerCase();
		Optional<User> userOpt = userRepository.findByEmail(targetEmail);

		if (userOpt.isPresent()) {
			User user = userOpt.get();
			String resetToken = UUID.randomUUID().toString();
			user.setResetToken(resetToken);
			user.setResetTokenExpiry(LocalDateTime.now().plusMinutes(30));
			userRepository.save(user);

			// Send SMTP email notification
			try {
				sendResetPasswordEmail(user.getEmail(), user.getFirstName(), resetToken);
			} catch (Exception e) {
				log.error("Failed to send password reset email to {}: {}", user.getEmail(), e.getMessage());
				user.setResetToken(null);
				user.setResetTokenExpiry(null);
				userRepository.save(user);
			}
		} else {
			log.info("[NOTIFICATION SERVICE] Password reset requested for non-existent email: {}", targetEmail);
		}

		return "If an account exists with email " + targetEmail + ", a password reset link has been sent.";
	}

	private void sendResetPasswordEmail(String toEmail, String firstName, String resetToken) {
		String baseUrl = (frontendUrl != null && !frontendUrl.isBlank()) ? frontendUrl : "http://localhost:5173";
		String resetUrl = baseUrl + "/reset-password?token=" + resetToken;
		if (mailSender == null) {
			log.warn("JavaMailSender bean not configured. Password reset email skipped for {}", toEmail);
			throw new IllegalStateException("Mail sender not configured");
		}
		SimpleMailMessage message = new SimpleMailMessage();
		message.setFrom("AutoCart <noreply@autocart.com>");
		message.setTo(toEmail);
		message.setSubject("AutoCart - Password Reset Request");
		message.setText("Hello " + (firstName != null ? firstName : "Customer") + ",\n\n" +
				"You requested a password reset for your AutoCart account.\n" +
				"Please click the link below to reset your password (valid for 30 minutes):\n\n" +
				resetUrl + "\n\n" +
				"If you did not request this, please ignore this email.\n\n" +
				"Best regards,\nAutoCart Team");
		mailSender.send(message);
		log.info("Password reset email sent to {}", toEmail);
	}

	public String resetPassword(ResetPasswordRequest request) {
		if (request.getToken() == null || request.getToken().isBlank()) {
			throw new IllegalArgumentException("Reset token is required");
		}
		if (request.getNewPassword() == null || request.getNewPassword().length() < 6) {
			throw new IllegalArgumentException("New password must be at least 6 characters");
		}

		User user = userRepository.findByResetToken(request.getToken())
				.orElseThrow(() -> new IllegalArgumentException("Invalid or expired password reset token."));

		if (user.getResetTokenExpiry() == null || user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
			throw new IllegalArgumentException("Password reset token has expired. Please request a new password reset link.");
		}

		user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
		user.setResetToken(null);
		user.setResetTokenExpiry(null);
		userRepository.save(user);

		return "Password reset successfully. You may now log in with your new password.";
	}
}