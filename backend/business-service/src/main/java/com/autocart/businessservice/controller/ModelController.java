package com.autocart.businessservice.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.autocart.businessservice.dto.ModelResponse;
import com.autocart.businessservice.service.ModelService;

@RestController
@RequestMapping("/api/models")
public class ModelController {

    private final ModelService modelService;

    public ModelController(ModelService modelService) {
        this.modelService = modelService;
    }

    @GetMapping("/{modelId}")
    public ResponseEntity<ModelResponse> getModelById(
            @PathVariable Long modelId) {

        return ResponseEntity.ok(
                modelService.getModelById(modelId)
        );
    }
}