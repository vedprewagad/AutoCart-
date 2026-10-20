package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "dealer_brands")
@com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DealerBrand {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "dealer_id", nullable = false)
    private Dealer dealer;

    @Column(name = "brand_id", nullable = false)
    private Long brandId;

    @Column(name = "auth_cert_url", length = 500)
    private String authCertUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DealerStatus status = DealerStatus.PENDING;

    @Column(name = "approved_by_admin_id")
    private Long approvedByAdminId;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;
}
