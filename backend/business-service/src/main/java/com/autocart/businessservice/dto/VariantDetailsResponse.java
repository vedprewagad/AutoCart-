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
public class VariantDetailsResponse {

    private Long id;

    private String brandName;
    
    private Long modelId;

    private String modelName;
    
    private String heroImage;

    private String variantName;

    private FuelType fuelType;

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

    private BigDecimal basePrice;

}