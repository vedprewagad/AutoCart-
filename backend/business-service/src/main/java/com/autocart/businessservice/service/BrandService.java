package com.autocart.businessservice.service;

import java.util.List;

import com.autocart.businessservice.dto.BrandResponse;

public interface BrandService {

	List<BrandResponse> getAllBrands();
	
	BrandResponse getBrandById(Long brandId);

}