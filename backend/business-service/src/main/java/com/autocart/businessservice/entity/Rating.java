package com.autocart.businessservice.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "ratings", uniqueConstraints = {
    @UniqueConstraint(name = "uq_user_dealer_rating", columnNames = {"user_id", "dealer_id"})
})
@Getter
@Setter
public class Rating {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "dealer_id", nullable = false)
    private Long dealerId;

    @Column(name = "rating_value", nullable = false)
    private Integer ratingValue;

    @Column(name = "review_text", length = 500)
    private String reviewText;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;
}
