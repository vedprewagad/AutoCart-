package com.autocart.businessservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.autocart.businessservice.entity.DealerOffer;
import java.util.List;

public interface DealerOfferRepository extends JpaRepository<DealerOffer, Long> {
    List<DealerOffer> findByInventoryId(Long inventoryId);
}
