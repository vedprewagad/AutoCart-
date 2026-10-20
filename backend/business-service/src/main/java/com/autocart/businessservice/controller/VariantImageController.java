package com.autocart.businessservice.controller;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.autocart.businessservice.dto.ImageResponse;
import com.autocart.businessservice.service.VariantImageService;

@RestController
@RequestMapping("/api/variants")
public class VariantImageController {

    private final VariantImageService imageService;

    public VariantImageController(VariantImageService imageService) {
        this.imageService = imageService;
    }

    @GetMapping("/{variantId}/images")
    public List<ImageResponse> getImagesByVariant(
            @PathVariable Long variantId) {

        return imageService.getImagesByVariant(variantId);
    }
}