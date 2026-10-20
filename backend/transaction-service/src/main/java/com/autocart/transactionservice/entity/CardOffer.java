package com.autocart.transactionservice.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "card_offers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CardOffer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "bank_id", nullable = false)
    private BankPartner bank;

    @Column(name = "card_type", nullable = false, length = 20)
    private String cardType; // CREDIT or DEBIT

    @Column(name = "card_network", length = 50)
    private String cardNetwork;

    @Column(name = "discount_percent")
    private Float discountPercent;

    @Column(name = "max_discount_cap", precision = 10, scale = 2)
    private BigDecimal maxDiscountCap;

    @Column(name = "min_transaction", precision = 10, scale = 2)
    private BigDecimal minTransaction;

    @Column(length = 255)
    private String description;

    @Column(name = "valid_from")
    private LocalDate validFrom;

    @Column(name = "valid_until")
    private LocalDate validUntil;
}
