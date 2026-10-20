package com.autocart.transactionservice.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "emi_products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EmiProduct {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "bank_id", nullable = false)
    private BankPartner bank;

    @Column(name = "product_name", nullable = false, length = 150)
    private String productName;

    @Column(name = "tenure_months", nullable = false)
    private Integer tenureMonths;

    @Column(name = "interest_rate", nullable = false)
    private Float interestRate;

    @Column(name = "processing_fee", precision = 10, scale = 2)
    private BigDecimal processingFee;

    @Column(name = "no_cost_emi")
    private Boolean noCostEmi = false;

    @Column(name = "min_loan_amount", precision = 12, scale = 2)
    private BigDecimal minLoanAmount;

    @Column(name = "max_loan_amount", precision = 12, scale = 2)
    private BigDecimal maxLoanAmount;

    @Column(name = "valid_until")
    private LocalDate validUntil;
}
