package com.autocart.transactionservice.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.autocart.transactionservice.repository.PurchaseEnquiryRepository;

@RestController
@RequestMapping("/api/internal/transactions")
public class InternalTransactionController {

    private final PurchaseEnquiryRepository purchaseEnquiryRepository;

    public InternalTransactionController(PurchaseEnquiryRepository purchaseEnquiryRepository) {
        this.purchaseEnquiryRepository = purchaseEnquiryRepository;
    }

    @GetMapping("/enquiries/user/{userId}/dealer/{dealerId}/completed-count")
    public ResponseEntity<Map<String, Object>> getCompletedOrProcessedEnquiryCount(
            @PathVariable Long userId,
            @PathVariable Long dealerId) {
        long count = purchaseEnquiryRepository.countCompletedOrProcessedEnquiries(userId, dealerId);
        return ResponseEntity.ok(Map.of("count", count));
    }

    @PostMapping("/enquiries/count-by-inventories")
    public ResponseEntity<Map<String, Object>> getEnquiryCountByInventories(@RequestBody java.util.List<Long> inventoryIds) {
        if (inventoryIds == null || inventoryIds.isEmpty()) {
            return ResponseEntity.ok(Map.of("count", 0L));
        }
        long count = purchaseEnquiryRepository.countByInventoryIdIn(inventoryIds);
        return ResponseEntity.ok(Map.of("count", count));
    }
}
