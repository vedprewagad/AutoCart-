package com.autocart.businessservice.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.util.List;

import jakarta.persistence.OneToMany;
import jakarta.persistence.CascadeType;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "brands")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Brand {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false, unique = true, length = 100)
	private String name;

	@Column(name = "logo_url", length = 500)
	private String logoUrl;

	@Column(name = "origin_country", length = 100)
	private String originCountry;

	@Column(name = "created_at", updatable = false)
	private LocalDateTime createdAt;
	
	@Column(name = "banner_url", length = 255)
	private String bannerUrl;

	@Column(length = 255)
	private String tagline;

	@PrePersist
	public void onCreate() {
		this.createdAt = LocalDateTime.now();
	}

	@com.fasterxml.jackson.annotation.JsonIgnore
	@OneToMany(mappedBy = "brand", cascade = CascadeType.ALL)
	private List<CarModel> carModels;
}
