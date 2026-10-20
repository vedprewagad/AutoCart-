package com.autocart.transactionservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.autocart.transactionservice.entity.CardOffer;
import java.util.List;

public interface CardOfferRepository extends JpaRepository<CardOffer, Long> {
    List<CardOffer> findByBankId(Long bankId);
    void deleteByBankId(Long bankId);
}
