package com.autocart.businessservice.service;

import java.util.List;

import com.autocart.businessservice.dto.ImageResponse;

public interface VariantImageService {

    List<ImageResponse> getImagesByVariant(Long variantId);

}