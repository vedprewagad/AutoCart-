package com.autocart.businessservice.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.autocart.businessservice.dto.BrandResponse;
import com.autocart.businessservice.dto.ModelResponse;
import com.autocart.businessservice.service.BrandService;
import com.autocart.businessservice.service.ModelService;

@RestController
@RequestMapping("/api/brands")
public class BrandController {

	private final BrandService brandService;

	private final ModelService modelService;

	public BrandController(BrandService brandService, ModelService modelService) {

		this.brandService = brandService;
		this.modelService = modelService;
	}

	@GetMapping
	public List<BrandResponse> getAllBrands() {
		return brandService.getAllBrands();
	}

	@GetMapping("/{brandId}")
	public BrandResponse getBrandById(@PathVariable Long brandId) {
		return brandService.getBrandById(brandId);
	}

	@GetMapping("/{brandId}/models")
	public List<ModelResponse> getModelsByBrand(@PathVariable Long brandId) {

		return modelService.getModelsByBrand(brandId);
	}
}