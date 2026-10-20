package com.autocart.businessservice.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "dealer_inventory")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DealerInventory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "dealer_id", nullable = false)
    private Long dealerId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "variant_id", nullable = false)
    private CarVariant variant;

    @Column(name = "listed_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal listedPrice;

    @Column(name = "discount_amount", precision = 12, scale = 2)
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @Column(name = "discount_type", length = 20)
    private String discountType; // FLAT or PERCENTAGE

    @Column(name = "units_available", nullable = false)
    private Integer unitsAvailable = 0;

    @Column(name = "delivery_days")
    private Integer deliveryDays;

    @Column(name = "discount_valid_until")
    private LocalDate discountValidUntil;

    @Column(name = "approval_status", nullable = false, length = 20)
    private String approvalStatus = "PENDING"; // PENDING, APPROVED, REJECTED

    @Column(name = "listing_status", nullable = false, length = 20)
    private String listingStatus = "ACTIVE"; // ACTIVE, INACTIVE, SOLD_OUT

    @Column(name = "rejection_reason")
    private String rejectionReason;

    @Column(name = "approved_by_admin_id")
    private Long approvedByAdminId;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @Transient
    private String showroomName;

    @Transient
    private String contactPhone;
}
