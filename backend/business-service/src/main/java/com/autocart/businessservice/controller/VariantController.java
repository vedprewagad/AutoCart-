package com.autocart.businessservice.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.autocart.businessservice.dto.VariantDetailsResponse;
import com.autocart.businessservice.dto.VariantResponse;
import com.autocart.businessservice.service.VariantService;

@RestController
@RequestMapping("/api/variants")
public class VariantController {

    private final VariantService variantService;

    public VariantController(VariantService variantService) {
        this.variantService = variantService;
    }

    @GetMapping("/model/{modelId}")
    public List<VariantResponse> getVariantsByModel(
            @PathVariable Long modelId) {

        return variantService.getVariantsByModel(modelId);
    }

    @GetMapping("/{variantId}")
    public VariantDetailsResponse getVariantDetails(
            @PathVariable Long variantId) {

        return variantService.getVariantDetails(variantId);
    }
}