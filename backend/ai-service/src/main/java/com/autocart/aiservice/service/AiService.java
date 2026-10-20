package com.autocart.aiservice.service;

import com.autocart.aiservice.dto.AiSearchRequest;
import com.autocart.aiservice.dto.AiSearchResponse;

public interface AiService {

    AiSearchResponse searchVehiclesWithAi(AiSearchRequest request);

}
