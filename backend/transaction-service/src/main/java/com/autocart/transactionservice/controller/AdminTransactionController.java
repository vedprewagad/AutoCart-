package com.autocart.transactionservice.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.autocart.transactionservice.entity.BankPartner;
import com.autocart.transactionservice.entity.EmiProduct;
import com.autocart.transactionservice.entity.CardOffer;
import com.autocart.transactionservice.repository.BankPartnerRepository;
import com.autocart.transactionservice.repository.EmiProductRepository;
import com.autocart.transactionservice.repository.CardOfferRepository;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/transaction/admin")
public class AdminTransactionController {

    private final BankPartnerRepository bankPartnerRepository;
    private final EmiProductRepository emiProductRepository;
    private final CardOfferRepository cardOfferRepository;

    public AdminTransactionController(
            BankPartnerRepository bankPartnerRepository,
            EmiProductRepository emiProductRepository,
            CardOfferRepository cardOfferRepository) {
        this.bankPartnerRepository = bankPartnerRepository;
        this.emiProductRepository = emiProductRepository;
        this.cardOfferRepository = cardOfferRepository;
    }

    // --- BANK PARTNERS ---
    @PostMapping("/banks")
    public ResponseEntity<BankPartner> createBank(@RequestBody BankPartner bank) {
        return ResponseEntity.ok(bankPartnerRepository.save(bank));
    }

    @org.springframework.transaction.annotation.Transactional
    @DeleteMapping("/banks/{id}")
    public ResponseEntity<String> deleteBank(@PathVariable Long id) {
        emiProductRepository.deleteByBankId(id);
        cardOfferRepository.deleteByBankId(id);
        bankPartnerRepository.deleteById(id);
        return ResponseEntity.ok("Bank partner deleted successfully");
    }

    // --- EMI PRODUCTS ---
    @PostMapping("/emi-products")
    public ResponseEntity<EmiProduct> createEmiProduct(@RequestBody EmiProductRequest request) {
        BankPartner bank = bankPartnerRepository.findById(request.getBankId())
                .orElseThrow(() -> new RuntimeException("Bank not found: " + request.getBankId()));

        EmiProduct product = new EmiProduct();
        product.setBank(bank);
        product.setProductName(request.getProductName());
        product.setTenureMonths(request.getTenureMonths());
        product.setInterestRate(request.getInterestRate());
        product.setProcessingFee(request.getProcessingFee());
        product.setNoCostEmi(request.getNoCostEmi() != null ? request.getNoCostEmi() : false);
        product.setMinLoanAmount(request.getMinLoanAmount());
        product.setMaxLoanAmount(request.getMaxLoanAmount());

        return ResponseEntity.ok(emiProductRepository.save(product));
    }

    @DeleteMapping("/emi-products/{id}")
    public ResponseEntity<String> deleteEmiProduct(@PathVariable Long id) {
        emiProductRepository.deleteById(id);
        return ResponseEntity.ok("EMI product deleted successfully");
    }

    // --- CARD OFFERS ---
    @PostMapping("/card-offers")
    public ResponseEntity<CardOffer> createCardOffer(@RequestBody CardOfferRequest request) {
        BankPartner bank = bankPartnerRepository.findById(request.getBankId())
                .orElseThrow(() -> new RuntimeException("Bank not found: " + request.getBankId()));

        CardOffer offer = new CardOffer();
        offer.setBank(bank);
        offer.setCardType(request.getCardType() != null ? request.getCardType().toUpperCase() : "CREDIT");
        offer.setCardNetwork(request.getCardNetwork());
        offer.setDiscountPercent(request.getDiscountPercent());
        offer.setMaxDiscountCap(request.getMaxDiscountCap());
        offer.setMinTransaction(request.getMinTransaction());
        offer.setDescription(request.getDescription());
        offer.setValidFrom(request.getValidFrom() != null ? request.getValidFrom() : LocalDate.now());
        offer.setValidUntil(request.getValidUntil() != null ? request.getValidUntil() : LocalDate.now().plusMonths(12));

        return ResponseEntity.ok(cardOfferRepository.save(offer));
    }

    @DeleteMapping("/card-offers/{id}")
    public ResponseEntity<String> deleteCardOffer(@PathVariable Long id) {
        cardOfferRepository.deleteById(id);
        return ResponseEntity.ok("Card offer deleted successfully");
    }

    @Getter
    @Setter
    public static class EmiProductRequest {
        private Long bankId;
        private String productName;
        private Integer tenureMonths;
        private Float interestRate;
        private BigDecimal processingFee;
        private Boolean noCostEmi;
        private BigDecimal minLoanAmount;
        private BigDecimal maxLoanAmount;
    }

    @Getter
    @Setter
    public static class CardOfferRequest {
        private Long bankId;
        private String cardType;
        private String cardNetwork;
        private Float discountPercent;
        private BigDecimal maxDiscountCap;
        private BigDecimal minTransaction;
        private String description;
        private LocalDate validFrom;
        private LocalDate validUntil;
    }
}
