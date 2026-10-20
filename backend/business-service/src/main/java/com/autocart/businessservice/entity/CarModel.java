package com.autocart.businessservice.entity;

import java.time.LocalDateTime;

import com.autocart.businessservice.entity.BodyType;
import java.util.List;
import jakarta.persistence.OneToMany;
import jakarta.persistence.CascadeType;

import jakarta.persistence.*;
import lombok.*;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "car_models")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CarModel {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.EAGER)
	@JoinColumn(name = "brand_id", nullable = false)
	@JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "models"})
	private Brand brand;

	@com.fasterxml.jackson.annotation.JsonIgnore
	@OneToMany(mappedBy = "model", cascade = CascadeType.ALL)
	private List<CarVariant> variants;

	@Column(nullable = false, length = 100)
	private String name;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private BodyType bodyType;

	private Integer launchYear;
	
	@Column(length = 255)
	private String thumbnail;

	@Column(updatable = false)
	private LocalDateTime createdAt;

	@PrePersist
	public void onCreate() {
		this.createdAt = LocalDateTime.now();
	}

}