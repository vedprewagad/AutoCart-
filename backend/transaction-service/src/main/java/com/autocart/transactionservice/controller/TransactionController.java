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

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(TransactionController.class);

    private final BankPartnerRepository bankPartnerRepository;
    private final EmiProductRepository emiProductRepository;
    private final CardOfferRepository cardOfferRepository;
    private final PurchaseEnquiryRepository purchaseEnquiryRepository;
    private final JdbcTemplate jdbcTemplate;

    @Autowired(required = false)
    private org.springframework.web.client.RestTemplate restTemplate;

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

        // 1. Resolve and verify dealerId directly via BUSINESS-SERVICE REST API
        Long inventoryDealerId = null;
        Map<String, Object> invSummary = null;
        if (restTemplate != null) {
            try {
                @SuppressWarnings("unchecked")
                Map<String, Object> fetched = restTemplate.getForObject(
                        "http://BUSINESS-SERVICE/api/internal/inventory/" + request.getInventoryId() + "/summary",
                        Map.class
                );
                invSummary = fetched;
                if (invSummary != null && invSummary.get("dealerId") != null) {
                    inventoryDealerId = ((Number) invSummary.get("dealerId")).longValue();
                }
            } catch (Exception ignored) {
            }
        }
        if (inventoryDealerId == null && jdbcTemplate != null) {
            try {
                inventoryDealerId = jdbcTemplate.queryForObject(
                        "SELECT dealer_id FROM dealer_inventory WHERE id = ?", Long.class, request.getInventoryId());
            } catch (org.springframework.dao.EmptyResultDataAccessException ignored) {
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

        // 2. Atomic stock decrement: decrement only if units_available > 0
        boolean stockDecrementedViaRest = false;
        if (restTemplate != null) {
            try {
                org.springframework.http.ResponseEntity<Map> decResp = restTemplate.exchange(
                        "http://BUSINESS-SERVICE/api/internal/inventory/" + request.getInventoryId() + "/decrement-stock",
                        org.springframework.http.HttpMethod.PUT,
                        null,
                        Map.class
                );
                if (decResp.getStatusCode().is2xxSuccessful()) {
                    stockDecrementedViaRest = true;
                }
            } catch (org.springframework.web.client.HttpStatusCodeException sce) {
                if (sce.getStatusCode().value() == 409) {
                    return ResponseEntity.status(org.springframework.http.HttpStatus.BAD_REQUEST)
                            .body(Map.of("error", "Vehicle is currently out of stock or inventory listing is unavailable."));
                }
            } catch (Exception ignored) {
            }
        }

        if (!stockDecrementedViaRest && jdbcTemplate != null) {
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

        // 3. Server-side price calculation: Ground truth calculation ignoring client finalPriceShown
        java.math.BigDecimal listedPrice = null;
        java.math.BigDecimal dealerDiscount = java.math.BigDecimal.ZERO;

        if (invSummary != null) {
            if (invSummary.get("listedPrice") != null) {
                listedPrice = new java.math.BigDecimal(invSummary.get("listedPrice").toString());
            }
            if (invSummary.get("discountAmount") != null) {
                dealerDiscount = new java.math.BigDecimal(invSummary.get("discountAmount").toString());
            }
        }
        if (listedPrice == null && jdbcTemplate != null) {
            try {
                Map<String, Object> row = jdbcTemplate.queryForMap(
                        "SELECT listed_price, discount_amount FROM dealer_inventory WHERE id = ?", request.getInventoryId());
                if (row.get("listed_price") != null) {
                    listedPrice = new java.math.BigDecimal(row.get("listed_price").toString());
                }
                if (row.get("discount_amount") != null) {
                    dealerDiscount = new java.math.BigDecimal(row.get("discount_amount").toString());
                }
            } catch (Exception ignored) {
            }
        }
        if (listedPrice == null) {
            listedPrice = java.math.BigDecimal.ZERO;
        }

        java.math.BigDecimal dealerBasePrice = listedPrice.subtract(dealerDiscount);
        if (dealerBasePrice.compareTo(java.math.BigDecimal.ZERO) < 0) {
            dealerBasePrice = java.math.BigDecimal.ZERO;
        }

        java.math.BigDecimal cardDiscount = java.math.BigDecimal.ZERO;
        String appliedOfferDescription = null;

        if (request.getCardOfferId() != null) {
            CardOffer offer = cardOfferRepository.findById(request.getCardOfferId()).orElse(null);
            if (offer != null) {
                java.math.BigDecimal minTxn = offer.getMinTransaction() != null ? offer.getMinTransaction() : java.math.BigDecimal.ZERO;
                if (dealerBasePrice.compareTo(minTxn) >= 0 && offer.getDiscountPercent() != null) {
                    java.math.BigDecimal rawDiscount = dealerBasePrice
                            .multiply(java.math.BigDecimal.valueOf(offer.getDiscountPercent()))
                            .divide(java.math.BigDecimal.valueOf(100), 2, java.math.RoundingMode.HALF_UP);
                    java.math.BigDecimal cap = offer.getMaxDiscountCap() != null ? offer.getMaxDiscountCap() : java.math.BigDecimal.valueOf(25000);
                    cardDiscount = rawDiscount.min(cap);
                    appliedOfferDescription = offer.getDescription();
                }
            }
        }

        java.math.BigDecimal serverFinalPrice = dealerBasePrice.subtract(cardDiscount);
        if (serverFinalPrice.compareTo(java.math.BigDecimal.ZERO) < 0) {
            serverFinalPrice = java.math.BigDecimal.ZERO;
        }

        // 4. Save purchase enquiry with atomic compensation rollback if saving fails
        PurchaseEnquiry saved;
        try {
            PurchaseEnquiry enquiry = new PurchaseEnquiry();
            enquiry.setUserId(authenticatedUserId);
            enquiry.setDealerId(inventoryDealerId);
            enquiry.setInventoryId(request.getInventoryId());
            enquiry.setSelectedColour(request.getSelectedColour());
            enquiry.setFinancePreference(request.getFinancePreference() != null ? request.getFinancePreference() : "CASH");
            
            if ("EMI".equalsIgnoreCase(request.getFinancePreference()) && request.getEmiProductId() != null) {
                EmiProduct emi = emiProductRepository.findById(request.getEmiProductId()).orElse(null);
                enquiry.setEmiProductId(emi != null ? emi.getId() : null);
            } else {
                enquiry.setEmiProductId(null);
            }

            enquiry.setCardOfferId(request.getCardOfferId());
            enquiry.setCardOfferApplied(appliedOfferDescription);
            enquiry.setFinalPriceShown(serverFinalPrice);

            // Server-side payment simulation: Ignore client's paymentStatus and transactionId
            enquiry.setTransactionId("TXN-" + java.util.UUID.randomUUID());
            enquiry.setPaymentStatus("PAID");
            enquiry.setStockReleased(false);

            // Stored snapshot at creation
            hydrateCustomerInfo(enquiry);

            saved = purchaseEnquiryRepository.save(enquiry);
        } catch (Exception ex) {
            // Compensating rollback: restore decremented stock if enquiry persist fails
            if (stockDecrementedViaRest && restTemplate != null) {
                try {
                    restTemplate.put("http://BUSINESS-SERVICE/api/internal/inventory/" + request.getInventoryId() + "/increment-stock", null);
                } catch (Exception ignored) {
                }
            } else if (jdbcTemplate != null) {
                try {
                    jdbcTemplate.update("UPDATE dealer_inventory SET units_available = units_available + 1 WHERE id = ?", request.getInventoryId());
                } catch (Exception ignored) {
                }
            }
            throw ex;
        }

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
        if (enquiry == null) return;

        // 1. Customer User details via AUTH-SERVICE REST API
        if (enquiry.getUserId() != null) {
            boolean userHydrated = false;
            if (restTemplate != null) {
                try {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> uMap = restTemplate.getForObject(
                            "http://AUTH-SERVICE/api/internal/users/" + enquiry.getUserId(),
                            Map.class
                    );
                    if (uMap != null) {
                        String fn = uMap.get("firstName") != null ? uMap.get("firstName").toString() : "";
                        String ln = uMap.get("lastName") != null ? uMap.get("lastName").toString() : "";
                        String mob = uMap.get("mobile") != null ? uMap.get("mobile").toString() : "";
                        enquiry.setCustomerName((fn + " " + ln).trim());
                        enquiry.setCustomerMobile(mob);
                        userHydrated = true;
                    }
                } catch (Exception ignored) {
                }
            }
            if (!userHydrated && jdbcTemplate != null) {
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
        }

        // 2. Showroom details via AUTH-SERVICE REST API
        if (enquiry.getDealerId() != null) {
            boolean dealerHydrated = false;
            if (restTemplate != null) {
                try {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> dMap = restTemplate.getForObject(
                            "http://AUTH-SERVICE/api/internal/dealers/" + enquiry.getDealerId(),
                            Map.class
                    );
                    if (dMap != null && dMap.get("showroomName") != null) {
                        enquiry.setShowroomName((String) dMap.get("showroomName"));
                        dealerHydrated = true;
                    }
                } catch (Exception ignored) {
                }
            }
            if (!dealerHydrated && jdbcTemplate != null) {
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
        }

        // 3. Vehicle / Variant details via BUSINESS-SERVICE REST API
        if (enquiry.getInventoryId() != null) {
            boolean vehicleHydrated = false;
            if (restTemplate != null) {
                try {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> invSummary = restTemplate.getForObject(
                            "http://BUSINESS-SERVICE/api/internal/inventory/" + enquiry.getInventoryId() + "/summary",
                            Map.class
                    );
                    if (invSummary != null) {
                        String bName = invSummary.get("brandName") != null ? invSummary.get("brandName").toString() : "";
                        String mName = invSummary.get("modelName") != null ? invSummary.get("modelName").toString() : "";
                        String vName = invSummary.get("variantName") != null ? invSummary.get("variantName").toString() : "";
                        enquiry.setCarModelName((bName + " " + mName).trim());
                        enquiry.setVariantName(vName);
                        vehicleHydrated = true;
                    }
                } catch (Exception ignored) {
                }
            }
            if (!vehicleHydrated && jdbcTemplate != null) {
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
            if (restTemplate != null) {
                try {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> dMap = restTemplate.getForObject(
                            "http://AUTH-SERVICE/api/internal/dealers/user/" + authenticatedUserId,
                            Map.class
                    );
                    if (dMap != null && dMap.get("dealerId") != null) {
                        authenticatedDealerId = ((Number) dMap.get("dealerId")).longValue();
                    }
                } catch (Exception ignored) {
                }
            }
            if (authenticatedDealerId == null && jdbcTemplate != null) {
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
            if (restTemplate != null) {
                try {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> dMap = restTemplate.getForObject(
                            "http://AUTH-SERVICE/api/internal/dealers/user/" + authenticatedUserId,
                            Map.class
                    );
                    if (dMap != null && dMap.get("dealerId") != null) {
                        authenticatedDealerId = ((Number) dMap.get("dealerId")).longValue();
                    }
                } catch (Exception ignored) {
                }
            }
            if (authenticatedDealerId == null && jdbcTemplate != null) {
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

        String currentStatus = enquiry.getStatus() != null ? enquiry.getStatus().toUpperCase() : "PENDING";
        if (List.of("COMPLETED", "REJECTED", "CANCELLED").contains(currentStatus)) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Cannot update enquiry in terminal state: " + currentStatus));
        }

        if ("PROCESSED".equals(currentStatus) && !List.of("COMPLETED", "CANCELLED", "REJECTED").contains(status)) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Invalid state transition from PROCESSED to " + status));
        }

        // BIZ-02: Restore inventory stock BEFORE saving status change (checked with stock_released flag)
        boolean isNewStatusCancelledOrRejected = "CANCELLED".equals(status) || "REJECTED".equals(status);

        if (enquiry.getInventoryId() != null && isNewStatusCancelledOrRejected && !enquiry.isStockReleased()) {
            boolean stockRestored = false;
            if (restTemplate != null) {
                try {
                    restTemplate.put("http://BUSINESS-SERVICE/api/internal/inventory/" + enquiry.getInventoryId() + "/increment-stock", null);
                    stockRestored = true;
                } catch (Exception ex) {
                    log.error("Failed to restore inventory stock via REST", ex);
                }
            }
            if (!stockRestored && jdbcTemplate != null) {
                try {
                    jdbcTemplate.update("UPDATE dealer_inventory SET units_available = units_available + 1 WHERE id = ?", enquiry.getInventoryId());
                    jdbcTemplate.update("UPDATE dealer_inventory SET listing_status = 'AVAILABLE' WHERE id = ? AND units_available > 0", enquiry.getInventoryId());
                    stockRestored = true;
                } catch (Exception ex) {
                    log.error("Failed to restore inventory stock via JDBC", ex);
                }
            }
            if (!stockRestored) {
                return ResponseEntity.status(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of("error", "Failed to update inventory stock. Status change aborted."));
            }
            enquiry.setStockReleased(true);
        }

        enquiry.setStatus(status);
        PurchaseEnquiry saved = purchaseEnquiryRepository.save(enquiry);

        // DATA-01: Call hydrateCustomerInfo before returning
        hydrateCustomerInfo(saved);
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
