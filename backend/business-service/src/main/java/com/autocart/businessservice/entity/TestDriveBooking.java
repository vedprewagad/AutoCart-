package com.autocart.businessservice.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "test_drive_bookings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TestDriveBooking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "dealer_id", nullable = false)
    private Long dealerId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "variant_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "model", "images"})
    private CarVariant variant;

    @Column(name = "preferred_date", nullable = false)
    private LocalDate preferredDate;

    @Column(name = "preferred_time", length = 20)
    private String preferredTime;

    @Column(nullable = false, length = 20)
    private String status = "PENDING"; // PENDING, CONFIRMED, COMPLETED, CANCELLED

    @Column(name = "cancellation_reason", length = 255)
    private String cancellationReason;

    @Column(name = "booked_at", insertable = false, updatable = false)
    private LocalDateTime bookedAt;

    @Column(name = "customer_name", length = 100)
    private String customerName;

    @Column(name = "customer_mobile", length = 20)
    private String customerMobile;

    @Column(name = "showroom_name", length = 150)
    private String showroomName;
}
