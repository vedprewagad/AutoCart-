package com.autocart.transactionservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.autocart.transactionservice.entity.PurchaseEnquiry;
import java.util.List;

public interface PurchaseEnquiryRepository extends JpaRepository<PurchaseEnquiry, Long> {
    List<PurchaseEnquiry> findByUserId(Long userId);
    List<PurchaseEnquiry> findByDealerId(Long dealerId);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(p) FROM PurchaseEnquiry p WHERE p.userId = :userId AND p.dealerId = :dealerId AND p.status IN ('PROCESSED', 'COMPLETED', 'DELIVERED')")
    long countCompletedOrProcessedEnquiries(@org.springframework.data.repository.query.Param("userId") Long userId, @org.springframework.data.repository.query.Param("dealerId") Long dealerId);

    long countByInventoryIdIn(List<Long> inventoryIds);
}
