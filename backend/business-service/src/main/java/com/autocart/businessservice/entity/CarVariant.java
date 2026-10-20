package com.autocart.businessservice.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import java.util.List;
import jakarta.persistence.CascadeType;
import jakarta.persistence.OneToMany;

import jakarta.persistence.*;
import lombok.*;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "car_variants")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CarVariant {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.EAGER)
	@JoinColumn(name = "model_id", nullable = false)
	@JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "variants"})
	private CarModel model;

	@com.fasterxml.jackson.annotation.JsonIgnore
	@OneToMany(mappedBy = "variant", cascade = CascadeType.ALL)
	private List<VariantImage> images;

	@Column(nullable = false, length = 150)
	private String variantName;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private FuelType fuelType;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private Transmission transmission;

	private Integer engineCc;

	private Float powerBhp;

	private Float torqueNm;

	private Float mileageKmpl;

	private Integer seatingCapacity;

	private Integer lengthMm;

	private Integer widthMm;

	private Integer heightMm;

	private Integer wheelbaseMm;

	private Integer bootSpaceLitres;

	private Integer airbags;

	private Boolean abs;

	private Boolean ebd;

	private String ncapRating;

	@Column(nullable = false, precision = 12, scale = 2)
	private BigDecimal basePrice;

	@Column(updatable = false)
	private LocalDateTime createdAt;

	@PrePersist
	public void onCreate() {
		this.createdAt = LocalDateTime.now();
	}

}