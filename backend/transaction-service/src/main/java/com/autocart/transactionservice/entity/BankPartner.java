package com.autocart.transactionservice.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "bank_partners")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BankPartner {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "bank_name", nullable = false, unique = true, length = 100)
    private String bankName;

    @Column(name = "logo_url", length = 500)
    private String logoUrl;

    @Column(name = "contact_email", length = 100)
    private String contactEmail;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;
}
