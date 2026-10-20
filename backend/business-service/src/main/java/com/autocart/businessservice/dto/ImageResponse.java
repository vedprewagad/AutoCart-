package com.autocart.businessservice.dto;

import com.autocart.businessservice.entity.ImageType;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ImageResponse {

    private Long id;

    private String imageUrl;

    private ImageType imageType;
    
    private String colourName;

}