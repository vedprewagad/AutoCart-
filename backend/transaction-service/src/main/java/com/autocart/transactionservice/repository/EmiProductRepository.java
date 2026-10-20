package com.autocart.transactionservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.autocart.transactionservice.entity.EmiProduct;
import java.util.List;

public interface EmiProductRepository extends JpaRepository<EmiProduct, Long> {
    List<EmiProduct> findByBankId(Long bankId);
    void deleteByBankId(Long bankId);
}
