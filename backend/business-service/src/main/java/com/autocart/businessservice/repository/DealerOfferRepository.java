package com.autocart.businessservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.autocart.businessservice.entity.DealerOffer;
import com.autocart.businessservice.entity.DealerInventory;
import java.util.List;

public interface DealerOfferRepository extends JpaRepository<DealerOffer, Long> {
    List<DealerOffer> findByInventory(DealerInventory inventory);
    List<DealerOffer> findByInventoryId(Long inventoryId);
}
