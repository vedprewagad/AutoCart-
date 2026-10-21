package com.autocart.businessservice.controller;

import com.autocart.businessservice.dto.DealerRatingSummaryDTO;
import com.autocart.businessservice.dto.RatingRequest;
import com.autocart.businessservice.dto.RatingResponse;
import com.autocart.businessservice.entity.Rating;
import com.autocart.businessservice.repository.RatingRepository;
import com.autocart.businessservice.security.JwtService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/ratings")
public class RatingController {

    @Autowired
    private RatingRepository ratingRepository;

    @Autowired
    private com.autocart.businessservice.repository.TestDriveBookingRepository testDriveBookingRepository;

    @Autowired(required = false)
    private JdbcTemplate jdbcTemplate;

    @Autowired(required = false)
    private org.springframework.web.client.RestTemplate restTemplate;

    @Autowired
    private JwtService jwtService;

    @PostMapping
    @Transactional
    public ResponseEntity<?> submitOrUpdateRating(@RequestBody RatingRequest request, HttpServletRequest httpRequest) {
        if (request.getDealerId() == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "dealerId is required"));
        }
        if (request.getRatingValue() == null || request.getRatingValue() < 1 || request.getRatingValue() > 5) {
            return ResponseEntity.badRequest().body(Map.of("error", "Rating value must be between 1 and 5"));
        }

        Long authenticatedUserId = resolveAuthenticatedUserId(httpRequest);
        if (authenticatedUserId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized: Valid user session required to submit rating"));
        }

        String role = resolveRole(httpRequest);
        if (role == null || !role.toUpperCase().contains("CUSTOMER")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Forbidden: Only customers can submit dealer ratings."));
        }

        boolean hasEligibleInteraction = false;
        // 1. Check local test drive interactions within business-service
        try {
            if (testDriveBookingRepository != null &&
                testDriveBookingRepository.existsByUserIdAndDealerIdAndStatus(authenticatedUserId, request.getDealerId(), "COMPLETED")) {
                hasEligibleInteraction = true;
            }
        } catch (Exception ignored) {
        }

        // 2. Check completed purchase enquiries via TRANSACTION-SERVICE REST API
        if (!hasEligibleInteraction && restTemplate != null) {
            try {
                @SuppressWarnings("unchecked")
                Map<String, Object> resp = restTemplate.getForObject(
                        "http://TRANSACTION-SERVICE/api/internal/transactions/enquiries/user/" + authenticatedUserId + "/dealer/" + request.getDealerId() + "/completed-count",
                        Map.class
                );
                if (resp != null && resp.get("count") != null) {
                    long count = ((Number) resp.get("count")).longValue();
                    if (count > 0) {
                        hasEligibleInteraction = true;
                    }
                }
            } catch (Exception ignored) {
            }
        }

        // 3. Fallback to local query if REST call timed out or during initial migration
        if (!hasEligibleInteraction && jdbcTemplate != null) {
            try {
                Integer testDriveCount = jdbcTemplate.queryForObject(
                        "SELECT COUNT(*) FROM test_drive_bookings WHERE user_id = ? AND dealer_id = ? AND status = 'COMPLETED'",
                        Integer.class,
                        authenticatedUserId,
                        request.getDealerId()
                );
                if (testDriveCount != null && testDriveCount > 0) {
                    hasEligibleInteraction = true;
                } else {
                    Integer enquiryCount = jdbcTemplate.queryForObject(
                            "SELECT COUNT(*) FROM purchase_enquiries WHERE user_id = ? AND dealer_id = ? AND status IN ('PROCESSED', 'COMPLETED', 'DELIVERED')",
                            Integer.class,
                            authenticatedUserId,
                            request.getDealerId()
                    );
                    if (enquiryCount != null && enquiryCount > 0) {
                        hasEligibleInteraction = true;
                    }
                }
            } catch (Exception ignored) {
            }
        }

        if (!hasEligibleInteraction) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Forbidden: You can only rate a dealer after having a completed test drive or processed/completed enquiry with them."));
        }

        Optional<Rating> existingOpt = ratingRepository.findByUserIdAndDealerId(authenticatedUserId, request.getDealerId());
        Rating rating = existingOpt.orElseGet(Rating::new);
        rating.setUserId(authenticatedUserId);
        rating.setDealerId(request.getDealerId());
        rating.setRatingValue(request.getRatingValue());
        rating.setReviewText(request.getReviewText());

        Rating saved = ratingRepository.save(rating);

        // Update overall dealer average rating in dealers table via AUTH-SERVICE REST API
        Double avgRating = ratingRepository.getAverageRatingForDealer(request.getDealerId());
        if (avgRating != null) {
            double roundedAvg = Math.round(avgRating * 10.0) / 10.0;
            boolean updatedViaRest = false;
            if (restTemplate != null) {
                try {
                    restTemplate.put("http://AUTH-SERVICE/api/internal/dealers/" + request.getDealerId() + "/rating?rating=" + roundedAvg, null);
                    updatedViaRest = true;
                } catch (Exception ignored) {
                }
            }
            if (!updatedViaRest && jdbcTemplate != null) {
                try {
                    jdbcTemplate.update("UPDATE dealers SET rating = ? WHERE id = ?", roundedAvg, request.getDealerId());
                } catch (Exception ignored) {
                }
            }
        }

        String customerName = fetchCustomerName(authenticatedUserId);
        RatingResponse response = new RatingResponse(
                saved.getId(),
                saved.getUserId(),
                saved.getDealerId(),
                customerName,
                saved.getRatingValue(),
                saved.getReviewText(),
                saved.getCreatedAt()
        );

        return ResponseEntity.ok(response);
    }

    @GetMapping("/dealer/{dealerId}")
    public ResponseEntity<DealerRatingSummaryDTO> getDealerRatings(@PathVariable Long dealerId) {
        List<Rating> ratings = ratingRepository.findByDealerIdOrderByCreatedAtDesc(dealerId);
        Double avgRating = ratingRepository.getAverageRatingForDealer(dealerId);
        Long totalCount = ratingRepository.countByDealerId(dealerId);

        String showroomName = "Authorized Dealer";
        if (restTemplate != null) {
            try {
                @SuppressWarnings("unchecked")
                Map<String, Object> dealerMap = restTemplate.getForObject(
                        "http://AUTH-SERVICE/api/internal/dealers/" + dealerId,
                        Map.class
                );
                if (dealerMap != null && dealerMap.get("showroomName") != null) {
                    showroomName = (String) dealerMap.get("showroomName");
                }
            } catch (Exception ignored) {
            }
        }
        if ("Authorized Dealer".equals(showroomName) && jdbcTemplate != null) {
            try {
                showroomName = jdbcTemplate.queryForObject(
                        "SELECT showroom_name FROM dealers WHERE id = ?",
                        String.class,
                        dealerId
                );
            } catch (Exception ignored) {
            }
        }

        List<RatingResponse> responses = new ArrayList<>();
        for (Rating r : ratings) {
            String customerName = fetchCustomerName(r.getUserId());
            responses.add(new RatingResponse(
                    r.getId(),
                    r.getUserId(),
                    r.getDealerId(),
                    customerName,
                    r.getRatingValue(),
                    r.getReviewText(),
                    r.getCreatedAt()
            ));
        }

        double roundedAvg = avgRating != null ? Math.round(avgRating * 10.0) / 10.0 : 0.0;
        DealerRatingSummaryDTO summary = new DealerRatingSummaryDTO(
                dealerId,
                showroomName,
                roundedAvg,
                totalCount != null ? totalCount : 0L,
                responses
        );

        return ResponseEntity.ok(summary);
    }

    @GetMapping("/user/{userId}/dealer/{dealerId}")
    public ResponseEntity<?> getUserRatingForDealer(
            @PathVariable Long userId,
            @PathVariable Long dealerId,
            HttpServletRequest httpRequest) {
        Long authenticatedUserId = resolveAuthenticatedUserId(httpRequest);
        if (authenticatedUserId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Unauthorized: Valid authentication required."));
        }

        String role = resolveRole(httpRequest);
        boolean isAdmin = role != null && (role.toUpperCase().contains("ADMIN") || role.toUpperCase().contains("SUPER_ADMIN"));

        if (!isAdmin && !authenticatedUserId.equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Forbidden: You can only view your own dealer rating."));
        }

        Optional<Rating> ratingOpt = ratingRepository.findByUserIdAndDealerId(userId, dealerId);
        if (ratingOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Rating r = ratingOpt.get();
        String customerName = fetchCustomerName(r.getUserId());
        RatingResponse response = new RatingResponse(
                r.getId(),
                r.getUserId(),
                r.getDealerId(),
                customerName,
                r.getRatingValue(),
                r.getReviewText(),
                r.getCreatedAt()
        );
        return ResponseEntity.ok(response);
    }

    private String fetchCustomerName(Long userId) {
        if (userId == null) return "Customer";
        if (restTemplate != null) {
            try {
                @SuppressWarnings("unchecked")
                Map<String, Object> userMap = restTemplate.getForObject(
                        "http://AUTH-SERVICE/api/internal/users/" + userId,
                        Map.class
                );
                if (userMap != null) {
                    String fn = userMap.get("firstName") != null ? userMap.get("firstName").toString() : "";
                    String ln = userMap.get("lastName") != null ? userMap.get("lastName").toString() : "";
                    String fullName = (fn + " " + ln).trim();
                    if (!fullName.isEmpty()) return fullName;
                }
            } catch (Exception ignored) {
            }
        }
        if (jdbcTemplate != null) {
            try {
                Map<String, Object> map = jdbcTemplate.queryForMap(
                        "SELECT first_name, last_name FROM users WHERE id = ?",
                        userId
                );
                String fn = map.get("first_name") != null ? map.get("first_name").toString() : "";
                String ln = map.get("last_name") != null ? map.get("last_name").toString() : "";
                return (fn + " " + ln).trim();
            } catch (Exception e) {
                return "Customer #" + userId;
            }
        }
        return "Customer #" + userId;
    }

    private Long resolveAuthenticatedUserId(HttpServletRequest request) {
        String token = null;
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("jwt".equals(cookie.getName())) {
                    token = cookie.getValue();
                    break;
                }
            }
        }
        if (token == null) {
            String authHeader = request.getHeader("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                token = authHeader.substring(7);
            }
        }

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
}
