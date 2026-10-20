package com.example.demo.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@Entity
@Table(name = "dealers")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class Dealer {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
        name = "user_id",
        nullable = false,
        unique = true
    )
    private User user;

    @Column(
        name = "showroom_name",
        nullable = false,
        length = 150
    )
    private String showroomName;

    @Column(
        name = "gst_number",
        nullable = false,
        unique = true,
        length = 15
    )
    private String gstNumber;

    @Column(
            name = "license_number",
            nullable = false,
            unique = true,
            length = 20
    )
    private String licenseNumber;

    @Column(length = 255)
    private String address;

    @Column(length = 100)
    private String city;

    @Column(length = 100)
    private String state;

    @Column(name = "pin_code", length = 10)
    private String pinCode;

    @Column(name = "contact_phone", length = 15)
    private String contactPhone;

    @Column(name = "working_hours", length = 100)
    private String workingHours;

    @Column(columnDefinition = "FLOAT DEFAULT 0")
    private Float rating;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DealerStatus status;
}