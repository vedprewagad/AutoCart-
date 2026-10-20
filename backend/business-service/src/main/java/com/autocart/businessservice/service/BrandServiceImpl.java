package com.autocart.businessservice.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.autocart.businessservice.dto.BrandResponse;
import com.autocart.businessservice.entity.Brand;
import com.autocart.businessservice.exception.ResourceNotFoundException;
import com.autocart.businessservice.repository.BrandRepository;

@Service
@Transactional(readOnly = true)
public class BrandServiceImpl implements BrandService {

	private final BrandRepository brandRepository;

	public BrandServiceImpl(BrandRepository brandRepository) {
		this.brandRepository = brandRepository;
	}

	@Override
	public List<BrandResponse> getAllBrands() {

		List<Brand> brands = brandRepository.findAll();

		return brands.stream().map(this::mapToBrandResponse).toList();
	}
	
	@Override
	public BrandResponse getBrandById(Long brandId) {

	    Brand brand = brandRepository.findById(brandId)
	            .orElseThrow(() ->
	                    new ResourceNotFoundException("Brand not found"));

	    return mapToBrandResponse(brand);
	}

	private BrandResponse mapToBrandResponse(Brand brand) {

		return new BrandResponse(

				brand.getId(),

				brand.getName(),

				brand.getLogoUrl(),

				brand.getBannerUrl(),

				brand.getTagline(),

				brand.getOriginCountry()

		);

	}
}