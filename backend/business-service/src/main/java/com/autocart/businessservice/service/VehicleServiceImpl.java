package com.autocart.businessservice.service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.autocart.businessservice.dto.VehicleCardResponse;
import com.autocart.businessservice.dto.VehiclePageResponse;
import com.autocart.businessservice.entity.CarVariant;
import com.autocart.businessservice.entity.FuelType;
import com.autocart.businessservice.entity.ImageType;
import com.autocart.businessservice.entity.VariantImage;
import com.autocart.businessservice.repository.CarVariantRepository;

import org.springframework.data.domain.Sort;

import com.autocart.businessservice.entity.BodyType;

@Service
@Transactional(readOnly = true)
public class VehicleServiceImpl implements VehicleService {

	private final CarVariantRepository carVariantRepository;

	public VehicleServiceImpl(CarVariantRepository carVariantRepository) {
		this.carVariantRepository = carVariantRepository;
	}

	@Override
	public VehiclePageResponse getAllVehicles(int page, int size, String brand, BodyType bodyType, FuelType fuelType, BigDecimal minPrice, BigDecimal maxPrice, String transmission, String sortBy) {

		Pageable pageable;
		if ("price_asc".equalsIgnoreCase(sortBy)) {
			pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "basePrice"));
		} else if ("price_desc".equalsIgnoreCase(sortBy)) {
			pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "basePrice"));
		} else if ("newest".equalsIgnoreCase(sortBy)) {
			pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"));
		} else {
			pageable = PageRequest.of(page, size);
		}

		Page<CarVariant> variantPage = carVariantRepository.findAllFiltered(pageable, brand, bodyType, fuelType, minPrice, maxPrice, transmission);

		List<VehicleCardResponse> vehicleCards = new ArrayList<>();

		for (CarVariant variant : variantPage.getContent()) {

			VehicleCardResponse response = new VehicleCardResponse();

			response.setVariantId(variant.getId());

			if (variant.getModel() != null) {
				response.setModelId(variant.getModel().getId());
				response.setBrand(variant.getModel().getBrand().getName());
				response.setModel(variant.getModel().getName());
				response.setBodyType(variant.getModel().getBodyType() != null ? variant.getModel().getBodyType().name() : null);
			}

			response.setVariant(variant.getVariantName());

			response.setBasePrice(variant.getBasePrice());
			
			response.setFuelType(variant.getFuelType());

			response.setTransmission(variant.getTransmission());

			String thumbnail = null;

			if (variant.getImages() != null) {

				for (VariantImage image : variant.getImages()) {

					if (image.getImageType() == ImageType.EXTERIOR) {
						thumbnail = image.getImageUrl();
						break;
					}
				}
			}

			if (thumbnail == null && variant.getModel() != null) {
				thumbnail = variant.getModel().getThumbnail();
			}

			response.setThumbnail(thumbnail);

			vehicleCards.add(response);
		}

		VehiclePageResponse pageResponse = new VehiclePageResponse();

		pageResponse.setContent(vehicleCards);
		pageResponse.setPage(variantPage.getNumber());
		pageResponse.setSize(variantPage.getSize());
		pageResponse.setTotalElements(variantPage.getTotalElements());
		pageResponse.setTotalPages(variantPage.getTotalPages());

		return pageResponse;
	}
}