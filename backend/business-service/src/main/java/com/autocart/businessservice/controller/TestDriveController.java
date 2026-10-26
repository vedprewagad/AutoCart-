package com.autocart.businessservice.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import com.autocart.businessservice.entity.TestDriveBooking;
import com.autocart.businessservice.entity.CarVariant;
import com.autocart.businessservice.repository.TestDriveBookingRepository;
import com.autocart.businessservice.repository.CarVariantRepository;
import com.autocart.businessservice.security.JwtService;
import com.autocart.businessservice.exception.ResourceNotFoundException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.beans.factory.annotation.Autowired;

@RestController
@RequestMapping("/api/test-drives")
public class TestDriveController {

    private final TestDriveBookingRepository bookingRepository;
    private final CarVariantRepository variantRepository;
    private final JwtService jwtService;
    private final JdbcTemplate jdbcTemplate;

    @Autowired(required = false)
    private org.springframework.web.client.RestTemplate restTemplate;

    public TestDriveController(
            TestDriveBookingRepository bookingRepository,
            CarVariantRepository variantRepository,
            JwtService jwtService,
            @Autowired(required = false) JdbcTemplate jdbcTemplate) {
        this.bookingRepository = bookingRepository;
        this.variantRepository = variantRepository;
        this.jwtService = jwtService;
        this.jdbcTemplate = jdbcTemplate;
    }

    @PostMapping
    public ResponseEntity<?> bookTestDrive(@RequestBody TestDriveRequest request, HttpServletRequest httpRequest) {
        Long authenticatedUserId = resolveAuthenticatedUserId(httpRequest);
        if (authenticatedUserId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Unauthorized: Valid authenticated session required to book test drive"));
        }

        if (request.getVariantId() == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Variant ID is required."));
        }
        CarVariant variant = variantRepository.findById(request.getVariantId()).orElse(null);
        if (variant == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Variant not found: " + request.getVariantId()));
        }

        if (request.getDealerId() == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Dealer ID is required."));
        }

        if (request.getPreferredDate() == null || request.getPreferredDate().isBefore(LocalDate.now())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Preferred date cannot be in the past."));
        }

        if (request.getPreferredTime() == null || request.getPreferredTime().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Preferred time is required."));
        }

        if (restTemplate != null) {
            try {
                org.springframework.http.ResponseEntity<Map> dResp = restTemplate.getForEntity(
                        "http://AUTH-SERVICE/api/internal/dealers/" + request.getDealerId(),
                        Map.class
                );
                if (!dResp.getStatusCode().is2xxSuccessful()) {
                    return ResponseEntity.badRequest().body(Map.of("error", "Dealer showroom not found: " + request.getDealerId()));
                }
            } catch (org.springframework.web.client.HttpClientErrorException.NotFound ex) {
                return ResponseEntity.badRequest().body(Map.of("error", "Dealer showroom not found: " + request.getDealerId()));
            } catch (Exception ignored) {
            }
        }

        boolean conflict = bookingRepository.existsByDealerIdAndVariant_IdAndPreferredDateAndPreferredTimeAndStatusNotIn(
                request.getDealerId(),
                request.getVariantId(),
                request.getPreferredDate(),
                request.getPreferredTime(),
                List.of("CANCELLED", "REJECTED")
        );
        if (conflict) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "This time slot is already booked, please choose another"));
        }

        TestDriveBooking booking = new TestDriveBooking();
        booking.setUserId(authenticatedUserId);
        booking.setDealerId(request.getDealerId());
        booking.setVariant(variant);
        booking.setPreferredDate(request.getPreferredDate());
        booking.setPreferredTime(request.getPreferredTime());
        booking.setStatus("PENDING");

        // Stored snapshot at creation
        hydrateCustomerInfo(booking);

        return ResponseEntity.ok(bookingRepository.save(booking));
    }

    private void hydrateCustomerInfo(TestDriveBooking booking) {
        if (booking == null) return;

        // 1. Customer User details
        if (booking.getUserId() != null && (booking.getCustomerName() == null || booking.getCustomerName().isBlank())) {
            boolean userHydrated = false;
            if (restTemplate != null) {
                try {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> uMap = restTemplate.getForObject(
                            "http://AUTH-SERVICE/api/internal/users/" + booking.getUserId(),
                            Map.class
                    );
                    if (uMap != null) {
                        String fn = uMap.get("firstName") != null ? uMap.get("firstName").toString() : "";
                        String ln = uMap.get("lastName") != null ? uMap.get("lastName").toString() : "";
                        String mob = uMap.get("mobile") != null ? uMap.get("mobile").toString() : "";
                        booking.setCustomerName((fn + " " + ln).trim());
                        booking.setCustomerMobile(mob);
                        userHydrated = true;
                    }
                } catch (Exception ignored) {
                }
            }
            if (!userHydrated && jdbcTemplate != null) {
                try {
                    Map<String, Object> row = jdbcTemplate.queryForMap(
                            "SELECT first_name, last_name, mobile FROM users WHERE id = ?",
                            booking.getUserId()
                    );
                    String fn = (String) row.get("first_name");
                    String ln = (String) row.get("last_name");
                    String mob = (String) row.get("mobile");
                    booking.setCustomerName((fn != null ? fn : "") + " " + (ln != null ? ln : ""));
                    booking.setCustomerMobile(mob);
                } catch (Exception ignored) {
                }
            }
        }

        // 2. Showroom details
        if (booking.getDealerId() != null && (booking.getShowroomName() == null || booking.getShowroomName().isBlank())) {
            boolean dealerHydrated = false;
            if (restTemplate != null) {
                try {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> dMap = restTemplate.getForObject(
                            "http://AUTH-SERVICE/api/internal/dealers/" + booking.getDealerId(),
                            Map.class
                    );
                    if (dMap != null && dMap.get("showroomName") != null) {
                        booking.setShowroomName((String) dMap.get("showroomName"));
                        dealerHydrated = true;
                    }
                } catch (Exception ignored) {
                }
            }
            if (!dealerHydrated && jdbcTemplate != null) {
                try {
                    Map<String, Object> dRow = jdbcTemplate.queryForMap(
                            "SELECT showroom_name FROM dealers WHERE id = ?",
                            booking.getDealerId()
                    );
                    String sName = (String) dRow.get("showroom_name");
                    if (sName != null && !sName.isBlank()) {
                        booking.setShowroomName(sName);
                    }
                } catch (Exception ignored) {
                }
            }
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserBookings(@PathVariable Long userId, HttpServletRequest request) {
        Long authUserId = resolveAuthenticatedUserId(request);
        if (authUserId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Unauthorized: Valid authentication required."));
        }

        String role = resolveRole(request);
        boolean isAdmin = role != null && (role.toUpperCase().contains("ADMIN") || role.toUpperCase().contains("SUPER_ADMIN"));

        if (!isAdmin && !authUserId.equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Forbidden: You can only view your own test drive bookings."));
        }

        List<TestDriveBooking> list = bookingRepository.findByUserId(userId);
        list.forEach(this::hydrateCustomerInfo);
        return ResponseEntity.ok(list);
    }

    @GetMapping("/dealer/{dealerId}")
    public ResponseEntity<?> getDealerBookings(@PathVariable Long dealerId, HttpServletRequest request) {
        Long authUserId = resolveAuthenticatedUserId(request);
        if (authUserId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Unauthorized: Valid authentication required."));
        }

        String role = resolveRole(request);
        boolean isAdmin = role != null && (role.toUpperCase().contains("ADMIN") || role.toUpperCase().contains("SUPER_ADMIN"));

        if (!isAdmin) {
            Long authDealerId = resolveDealerId(authUserId);
            if (authDealerId == null || !authDealerId.equals(dealerId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Forbidden: You can only access test drives for your own showroom."));
            }
        }

        List<TestDriveBooking> list = bookingRepository.findByDealerId(dealerId);
        list.forEach(this::hydrateCustomerInfo);
        return ResponseEntity.ok(list);
    }

    private static final java.util.Set<String> ALLOWED_TEST_DRIVE_STATUSES = java.util.Set.of("CONFIRMED", "COMPLETED", "CANCELLED");

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateBookingStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            HttpServletRequest request) {
        String rawStatus = body != null ? body.get("status") : null;
        if (rawStatus == null || rawStatus.isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Invalid status. Status cannot be empty. Allowed statuses: " + ALLOWED_TEST_DRIVE_STATUSES));
        }
        String requestedStatus = rawStatus.trim().toUpperCase();
        if (!ALLOWED_TEST_DRIVE_STATUSES.contains(requestedStatus)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Invalid status: '" + rawStatus + "'. Allowed statuses: " + ALLOWED_TEST_DRIVE_STATUSES));
        }

        TestDriveBooking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + id));

        Long authUserId = resolveAuthenticatedUserId(request);
        if (authUserId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Unauthorized: Valid authentication required."));
        }

        String token = extractToken(request);
        String role = null;
        if (token != null && jwtService.isTokenValid(token)) {
            role = jwtService.extractRole(token);
        }
        if (role == null) {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated()) {
                role = auth.getAuthorities().stream()
                        .map(a -> a.getAuthority().replace("ROLE_", ""))
                        .findFirst().orElse(null);
            }
        }

        String currentStatus = booking.getStatus() != null ? booking.getStatus().toUpperCase() : "PENDING";
        if (List.of("COMPLETED", "REJECTED", "CANCELLED").contains(currentStatus)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Cannot update test drive booking in terminal state: " + currentStatus));
        }

        if ("CONFIRMED".equals(currentStatus) && !List.of("COMPLETED", "CANCELLED", "REJECTED").contains(requestedStatus)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Invalid state transition from CONFIRMED to " + requestedStatus));
        }

        boolean isAdmin = role != null && (role.toUpperCase().contains("ADMIN") || role.toUpperCase().contains("SUPER_ADMIN"));

        if (!isAdmin) {
            if (role != null && role.toUpperCase().contains("CUSTOMER")) {
                if (!authUserId.equals(booking.getUserId())) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                            .body(Map.of("error", "Unauthorized: Customers can only modify their own test drive bookings."));
                }
                if (!"CANCELLED".equals(requestedStatus)) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                            .body(Map.of("error", "Forbidden: Customers may only cancel their own test drive bookings."));
                }
            } else if (role != null && role.toUpperCase().contains("DEALER")) {
                Long authDealerId = null;
                if (restTemplate != null) {
                    try {
                        @SuppressWarnings("unchecked")
                        Map<String, Object> dMap = restTemplate.getForObject(
                                "http://AUTH-SERVICE/api/internal/dealers/user/" + authUserId,
                                Map.class
                        );
                        if (dMap != null && dMap.get("dealerId") != null) {
                            authDealerId = ((Number) dMap.get("dealerId")).longValue();
                        }
                    } catch (Exception ignored) {
                    }
                }
                if (authDealerId == null && jdbcTemplate != null) {
                    try {
                        authDealerId = jdbcTemplate.queryForObject(
                                "SELECT id FROM dealers WHERE user_id = ?", Long.class, authUserId);
                    } catch (Exception ignored) {
                    }
                }
                if (authDealerId == null || !booking.getDealerId().equals(authDealerId)) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                            .body(Map.of("error", "Unauthorized: Dealer cannot modify test drive for another showroom."));
                }
            } else {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Unauthorized: Invalid role to modify test drive status."));
            }
        }

        booking.setStatus(requestedStatus);
        if (body.containsKey("cancellationReason")) {
            booking.setCancellationReason(body.get("cancellationReason"));
        }
        TestDriveBooking saved = bookingRepository.save(booking);
        hydrateCustomerInfo(saved);
        return ResponseEntity.ok(saved);
    }

    private Long resolveAuthenticatedUserId(HttpServletRequest request) {
        String token = extractToken(request);
        if (token != null && jwtService.isTokenValid(token)) {
            Long userId = jwtService.extractUserId(token);
            if (userId != null) return userId;
        }

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal()) && jdbcTemplate != null) {
            try {
                return jdbcTemplate.queryForObject("SELECT id FROM users WHERE email = ?", Long.class, auth.getName());
            } catch (Exception ignored) {
            }
        }

        return null;
    }

    private String extractToken(HttpServletRequest request) {
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("jwt".equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        return null;
    }

    private String resolveRole(HttpServletRequest request) {
        String token = extractToken(request);
        if (token != null && jwtService.isTokenValid(token)) {
            String role = jwtService.extractRole(token);
            if (role != null) return role;
        }
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated()) {
            return auth.getAuthorities().stream()
                    .map(a -> a.getAuthority().replace("ROLE_", ""))
                    .findFirst().orElse(null);
        }
        return null;
    }

    private Long resolveDealerId(Long userId) {
        if (userId != null && restTemplate != null) {
            try {
                @SuppressWarnings("unchecked")
                Map<String, Object> dMap = restTemplate.getForObject(
                        "http://AUTH-SERVICE/api/internal/dealers/user/" + userId,
                        Map.class
                );
                if (dMap != null && dMap.get("dealerId") != null) {
                    return ((Number) dMap.get("dealerId")).longValue();
                }
            } catch (Exception ignored) {
            }
        }
        if (userId != null && jdbcTemplate != null) {
            try {
                return jdbcTemplate.queryForObject(
                        "SELECT id FROM dealers WHERE user_id = ?", Long.class, userId);
            } catch (Exception ignored) {
            }
        }
        return null;
    }

    @Getter
    @Setter
    public static class TestDriveRequest {
        private Long userId;
        private Long dealerId;
        private Long variantId;
        private LocalDate preferredDate;
        private String preferredTime;
    }
}
