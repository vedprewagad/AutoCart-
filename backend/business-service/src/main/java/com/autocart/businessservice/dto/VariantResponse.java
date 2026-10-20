package com.autocart.businessservice.dto;

import java.math.BigDecimal;

import com.autocart.businessservice.entity.FuelType;
import com.autocart.businessservice.entity.Transmission;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class VariantResponse {

    private Long id;

    private String variantName;

    private FuelType fuelType;

    private Transmission transmission;

    private Integer engineCc;

    private Float mileageKmpl;

    private BigDecimal basePrice;

}