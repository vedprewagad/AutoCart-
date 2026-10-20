package com.autocart.businessservice.service;

import java.util.List;

import com.autocart.businessservice.dto.VariantDetailsResponse;
import com.autocart.businessservice.dto.VariantResponse;

public interface VariantService {

    List<VariantResponse> getVariantsByModel(Long modelId);
    
    VariantDetailsResponse getVariantDetails(Long variantId);

}