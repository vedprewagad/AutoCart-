package com.autocart.businessservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.autocart.businessservice.entity.DealerInventory;
import java.util.List;

public interface DealerInventoryRepository extends JpaRepository<DealerInventory, Long> {
    List<DealerInventory> findByDealerId(Long dealerId);
    List<DealerInventory> findByVariantIdAndApprovalStatusAndListingStatus(Long variantId, String approvalStatus, String listingStatus);
    List<DealerInventory> findByApprovalStatus(String approvalStatus);
}
