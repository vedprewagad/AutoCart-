package com.autocart.aiservice.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.autocart.aiservice.dto.AiSearchRequest;
import com.autocart.aiservice.dto.AiSearchResponse;
import com.autocart.aiservice.service.AiService;

@RestController
@RequestMapping("/api/ai")
public class AiSearchController {

    private final AiService aiService;

    public AiSearchController(AiService aiService) {
        this.aiService = aiService;
    }

    @PostMapping("/search-vehicles")
    public ResponseEntity<AiSearchResponse> searchVehiclesWithAi(@RequestBody AiSearchRequest request) {
        AiSearchResponse response = aiService.searchVehiclesWithAi(request);
        return ResponseEntity.ok(response);
    }
}
