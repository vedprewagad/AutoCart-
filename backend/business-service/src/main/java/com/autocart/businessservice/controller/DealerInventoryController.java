package com.autocart.businessservice.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import com.autocart.businessservice.entity.DealerInventory;
import com.autocart.businessservice.entity.DealerOffer;
import com.autocart.businessservice.entity.CarVariant;
import com.autocart.businessservice.dto.ApprovedDealerInventoryResponse;
import com.autocart.businessservice.repository.DealerInventoryRepository;
import com.autocart.businessservice.repository.DealerOfferRepository;
import com.autocart.businessservice.repository.CarVariantRepository;
import com.autocart.businessservice.security.JwtService;
import com.autocart.businessservice.exception.ResourceNotFoundException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.beans.factory.annotation.Autowired;

@RestController
@RequestMapping("/api")
public class DealerInventoryController {

    private final DealerInventoryRepository inventoryRepository;
    private final DealerOfferRepository offerRepository;
    private final CarVariantRepository variantRepository;
    private final JdbcTemplate jdbcTemplate;
    private final JwtService jwtService;

    @Autowired(required = false)
    private org.springframework.web.client.RestTemplate restTemplate;

    public DealerInventoryController(
            DealerInventoryRepository inventoryRepository,
            DealerOfferRepository offerRepository,
            CarVariantRepository variantRepository,
            @Autowired(required = false) JdbcTemplate jdbcTemplate,
            JwtService jwtService) {
        this.inventoryRepository = inventoryRepository;
        this.offerRepository = offerRepository;
        this.variantRepository = variantRepository;
        this.jdbcTemplate = jdbcTemplate;
        this.jwtService = jwtService;
    }

    @PostMapping("/dealer/inventory")
    public ResponseEntity<?> createInventory(@RequestBody InventoryRequest request, HttpServletRequest httpRequest) {
        Long authUserId = resolveAuthenticatedUserId(httpRequest);
        if (authUserId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Unauthorized: Valid authentication required."));
        }

        Long authDealerId = resolveDealerId(authUserId);
        if (authDealerId == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Forbidden: Authenticated user is not associated with an approved dealer showroom."));
        }

        // Ignore or reject mismatched dealerId in request body (SEC-07)
        if (request.getDealerId() != null && !request.getDealerId().equals(authDealerId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Forbidden: Cannot create inventory listings for another showroom."));
        }

        if (request.getListedPrice() != null && request.getListedPrice().compareTo(BigDecimal.ZERO) <= 0) {
            return ResponseEntity.badRequest().body(Map.of("error", "Listed price must be greater than zero."));
        }
        if (request.getDiscountAmount() != null && request.getDiscountAmount().compareTo(BigDecimal.ZERO) < 0) {
            return ResponseEntity.badRequest().body(Map.of("error", "Discount amount cannot be negative."));
        }
        if (request.getUnitsAvailable() != null && request.getUnitsAvailable() <= 0) {
            return ResponseEntity.badRequest().body(Map.of("error", "Units available must be greater than zero."));
        }
        if (request.getDeliveryDays() != null && request.getDeliveryDays() <= 0) {
            return ResponseEntity.badRequest().body(Map.of("error", "Delivery days must be greater than zero."));
        }

        CarVariant variant = variantRepository.findById(request.getVariantId())
                .orElseThrow(() -> new ResourceNotFoundException("Variant not found: " + request.getVariantId()));

        DealerInventory inventory = new DealerInventory();
        inventory.setDealerId(authDealerId);
        inventory.setVariant(variant);
        inventory.setListedPrice(request.getListedPrice());
        inventory.setDiscountAmount(request.getDiscountAmount() != null ? request.getDiscountAmount() : BigDecimal.ZERO);
        inventory.setDiscountType(request.getDiscountType() != null ? request.getDiscountType() : "FLAT");
        inventory.setUnitsAvailable(request.getUnitsAvailable() != null ? request.getUnitsAvailable() : 1);
        inventory.setDeliveryDays(request.getDeliveryDays() != null ? request.getDeliveryDays() : 7);
        inventory.setApprovalStatus("PENDING");
        inventory.setListingStatus("ACTIVE");

        DealerInventory saved = inventoryRepository.save(inventory);

        if (request.getOffers() != null) {
            for (OfferRequest oReq : request.getOffers()) {
                DealerOffer offer = new DealerOffer();
                offer.setInventory(saved);
                offer.setOfferType(oReq.getOfferType());
                offer.setOfferDescription(oReq.getOfferDescription());
                offerRepository.save(offer);
            }
        }

        return ResponseEntity.ok(saved);
    }

    @GetMapping("/dealer/inventory")
    public ResponseEntity<?> getDealerInventory(@RequestParam Long dealerId, HttpServletRequest httpRequest) {
        Long authUserId = resolveAuthenticatedUserId(httpRequest);
        if (authUserId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Unauthorized: Valid authentication required."));
        }

        String role = resolveRole(httpRequest);
        boolean isAdmin = role != null && (role.toUpperCase().contains("ADMIN") || role.toUpperCase().contains("SUPER_ADMIN"));

        if (!isAdmin) {
            Long authDealerId = resolveDealerId(authUserId);
            if (authDealerId == null || !authDealerId.equals(dealerId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Forbidden: You can only access inventory for your own showroom."));
            }
        }

        return ResponseEntity.ok(inventoryRepository.findByDealerId(dealerId));
    }

    @GetMapping("/vehicles/variant/{variantId}/dealers")
    public ResponseEntity<List<ApprovedDealerInventoryResponse>> getApprovedDealersForVariant(@PathVariable Long variantId) {
        List<DealerInventory> list = inventoryRepository.findByVariantIdAndApprovalStatusAndListingStatus(
                variantId, "APPROVED", "ACTIVE");
        List<ApprovedDealerInventoryResponse> dtoList = list.stream().map(inv -> {
            List<String> offers = offerRepository.findByInventoryId(inv.getId())
                    .stream().map(DealerOffer::getOfferDescription).collect(Collectors.toList());

            String showroomName = null;
            String city = null;
            String state = null;
            String contactPhone = null;
            Double rating = null;

            if (jdbcTemplate != null && inv.getDealerId() != null) {
                try {
                    Map<String, Object> row = jdbcTemplate.queryForMap(
                            "SELECT showroom_name, city, state, contact_phone, rating FROM dealers WHERE id = ?",
                            inv.getDealerId()
                    );
                    showroomName = (String) row.get("showroom_name");
                    city = (String) row.get("city");
                    state = (String) row.get("state");
                    contactPhone = (String) row.get("contact_phone");
                    if (row.get("rating") != null) {
                        rating = ((Number) row.get("rating")).doubleValue();
                    }
                } catch (Exception ignored) {
                }
            }

            if (showroomName == null || showroomName.isBlank()) {
                showroomName = "Authorized Dealer Showroom #" + inv.getDealerId();
            }

            return new ApprovedDealerInventoryResponse(
                    inv.getId(),
                    inv.getDealerId(),
                    inv.getVariant() != null ? inv.getVariant().getId() : null,
                    inv.getListedPrice(),
                    inv.getDiscountAmount(),
                    inv.getDiscountType(),
                    inv.getUnitsAvailable(),
                    inv.getDeliveryDays(),
                    offers,
                    showroomName,
                    city,
                    state,
                    contactPhone,
                    rating
            );
        }).collect(Collectors.toList());
        return ResponseEntity.ok(dtoList);
    }

    @GetMapping("/admin/inventory/pending")
    public ResponseEntity<List<DealerInventory>> getPendingInventoryListings() {
        List<DealerInventory> list = inventoryRepository.findByApprovalStatus("PENDING");
        if (jdbcTemplate != null) {
            for (DealerInventory inv : list) {
                if (inv.getDealerId() != null) {
                    try {
                        Map<String, Object> row = jdbcTemplate.queryForMap(
                                "SELECT showroom_name, contact_phone FROM dealers WHERE id = ?",
                                inv.getDealerId()
                        );
                        String sName = (String) row.get("showroom_name");
                        String phone = (String) row.get("contact_phone");
                        inv.setShowroomName(sName);
                        inv.setContactPhone(phone);
                    } catch (Exception ignored) {
                    }
                }
            }
        }
        return ResponseEntity.ok(list);
    }

    private static final java.util.Set<String> ALLOWED_INVENTORY_APPROVAL_STATUSES = java.util.Set.of("APPROVED", "REJECTED");

    @PutMapping("/admin/inventory/{inventoryId}/status")
    public ResponseEntity<?> updateInventoryStatus(
            @PathVariable Long inventoryId,
            @RequestBody Map<String, String> body) {
        DealerInventory inventory = inventoryRepository.findById(inventoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory listing not found: " + inventoryId));

        String rawStatus = body != null ? body.get("status") : null;
        if (rawStatus == null || rawStatus.isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Invalid status. Status cannot be empty. Allowed statuses: " + ALLOWED_INVENTORY_APPROVAL_STATUSES));
        }
        String status = rawStatus.trim().toUpperCase();
        if (!ALLOWED_INVENTORY_APPROVAL_STATUSES.contains(status)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Invalid status: '" + rawStatus + "'. Allowed statuses: " + ALLOWED_INVENTORY_APPROVAL_STATUSES));
        }

        String rejectionReason = body.get("rejectionReason");

        inventory.setApprovalStatus(status);
        if (rejectionReason != null) {
            inventory.setRejectionReason(rejectionReason);
        }
        return ResponseEntity.ok(inventoryRepository.save(inventory));
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

    @Getter
    @Setter
    public static class InventoryRequest {
        private Long dealerId;
        private Long variantId;
        private BigDecimal listedPrice;
        private BigDecimal discountAmount;
        private String discountType;
        private Integer unitsAvailable;
        private Integer deliveryDays;
        private List<OfferRequest> offers;
    }

    @Getter
    @Setter
    public static class OfferRequest {
        private String offerType;
        private String offerDescription;
    }
}
