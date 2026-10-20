package com.autocart.businessservice.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "dealer_offers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DealerOffer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @com.fasterxml.jackson.annotation.JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inventory_id", nullable = false)
    private DealerInventory inventory;

    @Column(name = "offer_type", nullable = false, length = 50)
    private String offerType; // EXCHANGE_BONUS, FESTIVE, CORPORATE, LOYALTY, OTHER

    @Column(name = "offer_description", length = 255)
    private String offerDescription;

    @Column(name = "valid_until")
    private LocalDate validUntil;
}
