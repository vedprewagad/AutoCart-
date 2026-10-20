package com.autocart.businessservice.dto;

import java.math.BigDecimal;

import com.autocart.businessservice.entity.BodyType;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ModelResponse {

    private Long id;

    private Long brandId;

    private String brandName;

    private String name;

    private BodyType bodyType;

    private Integer launchYear;

    private String thumbnail;

    private BigDecimal startingPrice;

}