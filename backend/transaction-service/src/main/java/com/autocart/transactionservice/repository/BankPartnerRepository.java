package com.autocart.transactionservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.autocart.transactionservice.entity.BankPartner;

public interface BankPartnerRepository extends JpaRepository<BankPartner, Long> {
}
