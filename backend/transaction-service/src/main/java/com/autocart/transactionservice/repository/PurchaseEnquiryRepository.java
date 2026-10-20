package com.autocart.transactionservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.autocart.transactionservice.entity.PurchaseEnquiry;
import java.util.List;

public interface PurchaseEnquiryRepository extends JpaRepository<PurchaseEnquiry, Long> {
    List<PurchaseEnquiry> findByUserId(Long userId);
    List<PurchaseEnquiry> findByDealerId(Long dealerId);
}
