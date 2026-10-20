package com.autocart.transactionservice.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.autocart.transactionservice.entity.BankPartner;
import com.autocart.transactionservice.entity.EmiProduct;
import com.autocart.transactionservice.entity.CardOffer;
import com.autocart.transactionservice.entity.PurchaseEnquiry;
import com.autocart.transactionservice.repository.BankPartnerRepository;
import com.autocart.transactionservice.repository.EmiProductRepository;
import com.autocart.transactionservice.repository.CardOfferRepository;
import com.autocart.transactionservice.repository.PurchaseEnquiryRepository;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.Map;

@RestController
@RequestMapping("/api/transaction")
public class TransactionController {

    private final BankPartnerRepository bankPartnerRepository;
    private final EmiProductRepository emiProductRepository;
    private final CardOfferRepository cardOfferRepository;
    private final PurchaseEnquiryRepository purchaseEnquiryRepository;
    private final JdbcTemplate jdbcTemplate;

    public TransactionController(
            BankPartnerRepository bankPartnerRepository,
            EmiProductRepository emiProductRepository,
            CardOfferRepository cardOfferRepository,
            PurchaseEnquiryRepository purchaseEnquiryRepository,
            @Autowired(required = false) JdbcTemplate jdbcTemplate) {
        this.bankPartnerRepository = bankPartnerRepository;
        this.emiProductRepository = emiProductRepository;
        this.cardOfferRepository = cardOfferRepository;
        this.purchaseEnquiryRepository = purchaseEnquiryRepository;
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping("/banks")
    public ResponseEntity<List<BankPartner>> getAllBanks() {
        return ResponseEntity.ok(bankPartnerRepository.findAll());
    }

    @GetMapping("/emi-products")
    public ResponseEntity<List<EmiProduct>> getEmiProducts() {
        return ResponseEntity.ok(emiProductRepository.findAll());
    }

    @GetMapping("/card-offers")
    public ResponseEntity<List<CardOffer>> getCardOffers() {
        List<CardOffer> list = cardOfferRepository.findAll();
        for (CardOffer offer : list) {
            if (offer.getDescription() != null) {
                offer.setDescription(offer.getDescription()
                        .replaceAll("Ôé\\|-", "")
                        .replaceAll("Ôé", "")
                        .replaceAll("\\|-", ""));
            }
        }
        return ResponseEntity.ok(list);
    }

    @Autowired
    private com.autocart.transactionservice.security.JwtService jwtService;

    @PostMapping("/enquiry")
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<?> createEnquiry(@RequestBody EnquiryRequest request, jakarta.servlet.http.HttpServletRequest httpRequest) {
        Long authenticatedUserId = resolveAuthenticatedUserId(httpRequest);
        if (authenticatedUserId == null) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Unauthorized: Valid authenticated session required to submit purchase enquiry"));
        }

        if (request.getInventoryId() == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Inventory ID is required to place purchase enquiry"));
        }

        // 1. Resolve and verify dealerId directly from the dealer_inventory listing (LOGIC-03)
        Long inventoryDealerId = null;
        if (jdbcTemplate != null) {
            try {
                inventoryDealerId = jdbcTemplate.queryForObject(
                        "SELECT dealer_id FROM dealer_inventory WHERE id = ?", Long.class, request.getInventoryId());
            } catch (org.springframework.dao.EmptyResultDataAccessException e) {
                return ResponseEntity.status(org.springframework.http.HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "Selected vehicle inventory listing does not exist or is unavailable."));
            }
        }
        if (inventoryDealerId == null) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Selected vehicle inventory listing does not exist or is unavailable."));
        }

        // Reject if request body dealerId is present and differs from inventory's dealerId
        if (request.getDealerId() != null && !request.getDealerId().equals(inventoryDealerId)) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Mismatched dealer ID for selected inventory listing."));
        }

        // 2. Atomic stock decrement (LOGIC-01): decrement only if units_available > 0
        // Do NOT wrap in catch that returns a response so unexpected errors propagate and trigger transaction rollback
        if (jdbcTemplate != null) {
            int rowsUpdated = jdbcTemplate.update(
                    "UPDATE dealer_inventory SET units_available = units_available - 1 WHERE id = ? AND units_available > 0",
                    request.getInventoryId()
            );
            if (rowsUpdated == 0) {
                return ResponseEntity.status(org.springframework.http.HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "Vehicle is currently out of stock or inventory listing is unavailable."));
            }
            jdbcTemplate.update(
                    "UPDATE dealer_inventory SET listing_status = 'OUT_OF_STOCK' WHERE id = ? AND units_available <= 0",
                    request.getInventoryId()
            );
        }

        // 3. Save purchase enquiry in the same transactional boundary
        PurchaseEnquiry enquiry = new PurchaseEnquiry();
        enquiry.setUserId(authenticatedUserId);
        enquiry.setDealerId(inventoryDealerId);
        enquiry.setInventoryId(request.getInventoryId());
        enquiry.setSelectedColour(request.getSelectedColour());
        enquiry.setFinancePreference(request.getFinancePreference() != null ? request.getFinancePreference() : "CASH");
        enquiry.setEmiProductId(request.getEmiProductId());
        enquiry.setCardOfferId(request.getCardOfferId());
        enquiry.setCardOfferApplied(request.getCardOfferApplied());
        enquiry.setFinalPriceShown(request.getFinalPriceShown());

        // 4. Server-side payment simulation (LOGIC-02): Ignore client's paymentStatus and transactionId
        // Simulates a real payment gateway callback confirming payment
        enquiry.setTransactionId("TXN-" + java.util.UUID.randomUUID());
        enquiry.setPaymentStatus("PAID");

        PurchaseEnquiry saved = purchaseEnquiryRepository.save(enquiry);

        hydrateCustomerInfo(saved);
        return ResponseEntity.ok(saved);
    }

    private Long resolveAuthenticatedUserId(jakarta.servlet.http.HttpServletRequest request) {
        String token = extractToken(request);
        if (token != null && jwtService.isTokenValid(token)) {
            Long userId = jwtService.extractUserId(token);
            if (userId != null) return userId;
        }

        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal()) && jdbcTemplate != null) {
            try {
                return jdbcTemplate.queryForObject("SELECT id FROM users WHERE email = ?", Long.class, auth.getName());
            } catch (Exception ignored) {
            }
        }

        return null;
    }

    private String extractRole(jakarta.servlet.http.HttpServletRequest request) {
        String token = extractToken(request);
        if (token != null && jwtService.isTokenValid(token)) {
            return jwtService.extractRole(token);
        }
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated()) {
            return auth.getAuthorities().stream()
                    .map(a -> a.getAuthority().replace("ROLE_", ""))
                    .findFirst().orElse(null);
        }
        return null;
    }

    private String extractToken(jakarta.servlet.http.HttpServletRequest request) {
        if (request.getCookies() != null) {
            for (jakarta.servlet.http.Cookie cookie : request.getCookies()) {
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

    private void hydrateCustomerInfo(PurchaseEnquiry enquiry) {
        if (jdbcTemplate != null) {
            if (enquiry.getUserId() != null) {
                try {
                    Map<String, Object> row = jdbcTemplate.queryForMap(
                            "SELECT first_name, last_name, mobile FROM users WHERE id = ?",
                            enquiry.getUserId()
                    );
                    String fn = (String) row.get("first_name");
                    String ln = (String) row.get("last_name");
                    String mob = (String) row.get("mobile");
                    enquiry.setCustomerName((fn != null ? fn : "") + " " + (ln != null ? ln : ""));
                    enquiry.setCustomerMobile(mob);
                } catch (Exception ignored) {
                }
            }
            if (enquiry.getDealerId() != null) {
                try {
                    Map<String, Object> dRow = jdbcTemplate.queryForMap(
                            "SELECT showroom_name FROM dealers WHERE id = ?",
                            enquiry.getDealerId()
                    );
                    String sName = (String) dRow.get("showroom_name");
                    if (sName != null && !sName.isBlank()) {
                        enquiry.setShowroomName(sName);
                    }
                } catch (Exception ignored) {
                }
            }
            if (enquiry.getInventoryId() != null) {
                try {
                    Map<String, Object> iRow = jdbcTemplate.queryForMap(
                            "SELECT b.name as brand_name, m.name as model_name, v.variant_name " +
                            "FROM dealer_inventory di " +
                            "JOIN car_variants v ON di.variant_id = v.id " +
                            "JOIN car_models m ON v.model_id = m.id " +
                            "JOIN brands b ON m.brand_id = b.id " +
                            "WHERE di.id = ?",
                            enquiry.getInventoryId()
                    );
                    String bName = (String) iRow.get("brand_name");
                    String mName = (String) iRow.get("model_name");
                    String vName = (String) iRow.get("variant_name");
                    enquiry.setCarModelName((bName != null ? bName : "") + " " + (mName != null ? mName : ""));
                    enquiry.setVariantName(vName);
                } catch (Exception ignored) {
                }
            }
        }
    }

    @GetMapping("/enquiries/user/{userId}")
    public ResponseEntity<?> getUserEnquiries(@PathVariable Long userId, jakarta.servlet.http.HttpServletRequest httpRequest) {
        Long authenticatedUserId = resolveAuthenticatedUserId(httpRequest);
        if (authenticatedUserId == null) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Unauthorized: Valid authenticated session required"));
        }

        String role = extractRole(httpRequest);
        boolean isAdmin = "ADMIN".equalsIgnoreCase(role) || "SUPER_ADMIN".equalsIgnoreCase(role);

        if (!isAdmin && !authenticatedUserId.equals(userId)) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Forbidden: You can only access your own purchase enquiries"));
        }

        List<PurchaseEnquiry> list = purchaseEnquiryRepository.findByUserId(userId);
        list.forEach(this::hydrateCustomerInfo);
        return ResponseEntity.ok(list);
    }

    @GetMapping("/enquiries/dealer/{dealerId}")
    public ResponseEntity<?> getDealerEnquiries(@PathVariable Long dealerId, jakarta.servlet.http.HttpServletRequest httpRequest) {
        Long authenticatedUserId = resolveAuthenticatedUserId(httpRequest);
        if (authenticatedUserId == null) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Unauthorized: Valid authenticated session required"));
        }

        String role = extractRole(httpRequest);
        boolean isAdmin = "ADMIN".equalsIgnoreCase(role) || "SUPER_ADMIN".equalsIgnoreCase(role);

        if (!isAdmin) {
            if (!"DEALER".equalsIgnoreCase(role)) {
                return ResponseEntity.status(org.springframework.http.HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Forbidden: Only authorized dealers or admins can access dealer enquiries"));
            }

            Long authenticatedDealerId = null;
            if (jdbcTemplate != null) {
                try {
                    authenticatedDealerId = jdbcTemplate.queryForObject(
                            "SELECT id FROM dealers WHERE user_id = ?", Long.class, authenticatedUserId);
                } catch (Exception ignored) {
                }
            }

            if (authenticatedDealerId == null || !authenticatedDealerId.equals(dealerId)) {
                return ResponseEntity.status(org.springframework.http.HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Forbidden: You can only access enquiries for your own showroom"));
            }
        }

        List<PurchaseEnquiry> list = purchaseEnquiryRepository.findByDealerId(dealerId);
        list.forEach(this::hydrateCustomerInfo);
        return ResponseEntity.ok(list);
    }

    private static final java.util.Set<String> ALLOWED_ENQUIRY_STATUSES = java.util.Set.of("PROCESSED", "COMPLETED", "REJECTED", "CANCELLED");

    @PutMapping("/enquiries/{id}/status")
    public ResponseEntity<?> updateEnquiryStatus(
            @PathVariable Long id,
            @RequestBody java.util.Map<String, String> body,
            jakarta.servlet.http.HttpServletRequest httpRequest) {
        String rawStatus = body != null ? body.get("status") : null;
        if (rawStatus == null || rawStatus.isBlank()) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Invalid status. Status cannot be empty. Allowed statuses: " + ALLOWED_ENQUIRY_STATUSES));
        }
        String status = rawStatus.trim().toUpperCase();
        if (!ALLOWED_ENQUIRY_STATUSES.contains(status)) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Invalid status: '" + rawStatus + "'. Allowed statuses: " + ALLOWED_ENQUIRY_STATUSES));
        }

        Long authenticatedUserId = resolveAuthenticatedUserId(httpRequest);
        if (authenticatedUserId == null) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Unauthorized: Valid authenticated session required"));
        }

        String role = extractRole(httpRequest);
        boolean isAdmin = "ADMIN".equalsIgnoreCase(role) || "SUPER_ADMIN".equalsIgnoreCase(role);

        PurchaseEnquiry enquiry = purchaseEnquiryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Enquiry not found: " + id));

        if (!isAdmin) {
            if (!"DEALER".equalsIgnoreCase(role)) {
                return ResponseEntity.status(org.springframework.http.HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Forbidden: Only authorized dealers or admins can update enquiry status"));
            }

            Long authenticatedDealerId = null;
            if (jdbcTemplate != null) {
                try {
                    authenticatedDealerId = jdbcTemplate.queryForObject(
                            "SELECT id FROM dealers WHERE user_id = ?", Long.class, authenticatedUserId);
                } catch (Exception ignored) {
                }
            }

            if (authenticatedDealerId == null || !authenticatedDealerId.equals(enquiry.getDealerId())) {
                return ResponseEntity.status(org.springframework.http.HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Forbidden: You can only update enquiries for your own showroom"));
            }
        }

        String previousStatus = enquiry.getStatus();
        enquiry.setStatus(status);
        PurchaseEnquiry saved = purchaseEnquiryRepository.save(enquiry);

        boolean isNewStatusCancelled = "CANCELLED".equalsIgnoreCase(status) || "REJECTED".equalsIgnoreCase(status);
        boolean wasPreviouslyCancelled = "CANCELLED".equalsIgnoreCase(previousStatus) || "REJECTED".equalsIgnoreCase(previousStatus);

        if (jdbcTemplate != null && enquiry.getInventoryId() != null) {
            if (isNewStatusCancelled && !wasPreviouslyCancelled) {
                try {
                    jdbcTemplate.update(
                            "UPDATE dealer_inventory SET units_available = units_available + 1 WHERE id = ?",
                            enquiry.getInventoryId()
                    );
                    jdbcTemplate.update(
                            "UPDATE dealer_inventory SET listing_status = 'AVAILABLE' WHERE id = ? AND units_available > 0",
                            enquiry.getInventoryId()
                    );
                } catch (Exception ignored) {
                }
            } else if (!isNewStatusCancelled && wasPreviouslyCancelled) {
                try {
                    jdbcTemplate.update(
                            "UPDATE dealer_inventory SET units_available = GREATEST(0, units_available - 1) WHERE id = ?",
                            enquiry.getInventoryId()
                    );
                    jdbcTemplate.update(
                            "UPDATE dealer_inventory SET listing_status = 'OUT_OF_STOCK' WHERE id = ? AND units_available <= 0",
                            enquiry.getInventoryId()
                    );
                } catch (Exception ignored) {
                }
            }
        }

        return ResponseEntity.ok(saved);
    }

    @Getter
    @Setter
    public static class EnquiryRequest {
        private Long userId;
        private Long dealerId;
        private Long inventoryId;
        private String selectedColour;
        private String financePreference;
        private Long emiProductId;
        private Long cardOfferId;
        private String cardOfferApplied;
        private BigDecimal finalPriceShown;
        private String transactionId;
        private String paymentStatus;
    }
}
