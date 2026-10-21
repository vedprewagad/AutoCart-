package com.autocart.businessservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.autocart.businessservice.entity.DealerInventory;
import java.util.List;

public interface DealerInventoryRepository extends JpaRepository<DealerInventory, Long> {
    List<DealerInventory> findByDealerId(Long dealerId);
    List<DealerInventory> findByVariantIdAndApprovalStatusAndListingStatus(Long variantId, String approvalStatus, String listingStatus);
    List<DealerInventory> findByApprovalStatus(String approvalStatus);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("UPDATE DealerInventory di SET di.unitsAvailable = di.unitsAvailable - 1 WHERE di.id = :id AND di.unitsAvailable > 0")
    int decrementUnitsAvailable(@org.springframework.data.repository.query.Param("id") Long id);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("UPDATE DealerInventory di SET di.unitsAvailable = di.unitsAvailable + 1 WHERE di.id = :id")
    int incrementUnitsAvailable(@org.springframework.data.repository.query.Param("id") Long id);
}
