package com.autocart.businessservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@Data
@AllArgsConstructor
@NoArgsConstructor
public class BrandResponse {

    private Long id;

    private String name;

    private String logoUrl;

    private String bannerUrl;

    private String tagline;

    private String originCountry;

}