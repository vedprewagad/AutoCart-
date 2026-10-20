package com.autocart.businessservice.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.autocart.businessservice.entity.VariantColour;
import com.autocart.businessservice.repository.VariantColourRepository;
import java.util.List;

@RestController
@RequestMapping("/api/variants")
public class VariantColourController {

    private final VariantColourRepository colourRepository;

    public VariantColourController(VariantColourRepository colourRepository) {
        this.colourRepository = colourRepository;
    }

    @GetMapping("/{variantId}/colours")
    public ResponseEntity<List<VariantColour>> getColoursByVariant(@PathVariable Long variantId) {
        List<VariantColour> colours = colourRepository.findByVariantId(variantId);
        return ResponseEntity.ok(colours);
    }

    @PostMapping("/{variantId}/colours")
    public ResponseEntity<VariantColour> addVariantColour(
            @PathVariable Long variantId,
            @RequestBody VariantColour colour) {
        colour.setVariantId(variantId);
        return ResponseEntity.ok(colourRepository.save(colour));
    }
}
