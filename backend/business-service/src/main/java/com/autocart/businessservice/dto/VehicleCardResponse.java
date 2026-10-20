package com.autocart.businessservice.dto;

import java.math.BigDecimal;

import com.autocart.businessservice.entity.FuelType;
import com.autocart.businessservice.entity.Transmission;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class VehicleCardResponse {

    private Long variantId;

    private Long modelId;

    private String brand;

    private String model;

    private String variant;

    private BigDecimal basePrice;

    private FuelType fuelType;

    private Transmission transmission;

    private String bodyType;

    private String thumbnail;

}