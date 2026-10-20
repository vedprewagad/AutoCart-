package com.autocart.businessservice.service;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.autocart.businessservice.dto.ModelResponse;
import com.autocart.businessservice.entity.Brand;
import com.autocart.businessservice.entity.CarModel;
import com.autocart.businessservice.entity.CarVariant;
import com.autocart.businessservice.exception.ResourceNotFoundException;
import com.autocart.businessservice.repository.BrandRepository;
import com.autocart.businessservice.repository.CarModelRepository;

@Service
@Transactional(readOnly = true)
public class ModelServiceImpl implements ModelService {

	private final BrandRepository brandRepository;
	private final CarModelRepository carModelRepository;

	public ModelServiceImpl(BrandRepository brandRepository, CarModelRepository carModelRepository) {
		this.brandRepository = brandRepository;
		this.carModelRepository = carModelRepository;
	}

	@Override
	public List<ModelResponse> getModelsByBrand(Long brandId) {

		Brand brand = brandRepository.findById(brandId)
				.orElseThrow(() -> new ResourceNotFoundException("Brand not found"));

		List<CarModel> models = carModelRepository.findByBrandWithVariants(brand);

		return models.stream().map(this::mapToModelResponse).toList();
	}
	
	@Override
	public ModelResponse getModelById(Long modelId) {

	    CarModel model = carModelRepository.findByIdWithVariants(modelId)
	            .orElseThrow(() ->
	                    new ResourceNotFoundException("Model not found"));

	    return mapToModelResponse(model);
	}

	private ModelResponse mapToModelResponse(CarModel model) {

		BigDecimal startingPrice = null;

		if (model.getVariants() != null && !model.getVariants().isEmpty()) {
			startingPrice = model.getVariants()
					.stream()
					.map(CarVariant::getBasePrice)
					.min(BigDecimal::compareTo)
					.orElse(null);
		}

		Long brandId = model.getBrand() != null ? model.getBrand().getId() : null;
		String brandName = model.getBrand() != null ? model.getBrand().getName() : null;

		return new ModelResponse(
				model.getId(),
				brandId,
				brandName,
				model.getName(),
				model.getBodyType(),
				model.getLaunchYear(),
				model.getThumbnail(),
				startingPrice
		);
	}
}