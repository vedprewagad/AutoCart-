package com.autocart.transactionservice.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "purchase_enquiries")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseEnquiry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "dealer_id", nullable = false)
    private Long dealerId;

    @Column(name = "inventory_id", nullable = false)
    private Long inventoryId;

    @Column(name = "selected_colour", length = 50)
    private String selectedColour;

    @Column(name = "finance_preference", length = 20)
    private String financePreference = "CASH"; // CASH, EMI, LOAN

    @Column(name = "emi_product_id")
    private Long emiProductId;

    @Column(name = "card_offer_id")
    private Long cardOfferId;

    @Column(name = "card_offer_applied", length = 255)
    private String cardOfferApplied;

    @Column(name = "final_price_shown", precision = 12, scale = 2)
    private BigDecimal finalPriceShown;

    @Column(name = "transaction_id", length = 100)
    private String transactionId;

    @Column(name = "payment_status", length = 50)
    private String paymentStatus = "UNPAID";

    @Column(name = "status", length = 20)
    private String status = "PENDING"; // PENDING, PROCESSED, REJECTED, COMPLETED

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @Transient
    private String customerName;

    @Transient
    private String customerMobile;

    @Transient
    private String showroomName;

    @Transient
    private String carModelName;

    @Transient
    private String variantName;
}
