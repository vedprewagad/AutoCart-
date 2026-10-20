package com.autocart.businessservice.service;

import java.util.List;

import com.autocart.businessservice.dto.ModelResponse;

public interface ModelService {

    List<ModelResponse> getModelsByBrand(Long brandId);
    
    ModelResponse getModelById(Long modelId);

}