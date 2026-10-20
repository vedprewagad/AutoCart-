package com.autocart.businessservice.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.autocart.businessservice.dto.VariantDetailsResponse;
import com.autocart.businessservice.dto.VariantResponse;
import com.autocart.businessservice.entity.CarModel;
import com.autocart.businessservice.entity.CarVariant;
import com.autocart.businessservice.exception.ResourceNotFoundException;
import com.autocart.businessservice.repository.CarModelRepository;
import com.autocart.businessservice.repository.CarVariantRepository;
import com.autocart.businessservice.service.VariantService;

import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class VariantServiceImpl implements VariantService {

    private final CarModelRepository carModelRepository;
    private final CarVariantRepository carVariantRepository;

    public VariantServiceImpl(CarModelRepository carModelRepository,
                              CarVariantRepository carVariantRepository) {
        this.carModelRepository = carModelRepository;
        this.carVariantRepository = carVariantRepository;
    }

    @Override
    public List<VariantResponse> getVariantsByModel(Long modelId) {

        CarModel model = carModelRepository.findById(modelId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Car model not found"));

        List<CarVariant> variants = carVariantRepository.findByModel(model);

        return variants.stream()
                .map(this::mapToVariantResponse)
                .toList();
    }

    private VariantResponse mapToVariantResponse(CarVariant variant) {

        return new VariantResponse(
                variant.getId(),
                variant.getVariantName(),
                variant.getFuelType(),
                variant.getTransmission(),
                variant.getEngineCc(),
                variant.getMileageKmpl(),
                variant.getBasePrice()
        );
    }
    
    @Override
    public VariantDetailsResponse getVariantDetails(Long variantId) {

        CarVariant variant = carVariantRepository.findById(variantId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Variant not found"));

        return mapToVariantDetailsResponse(variant);
    }
    
    private VariantDetailsResponse mapToVariantDetailsResponse(CarVariant variant) {

        return new VariantDetailsResponse(

                variant.getId(),

                variant.getModel().getBrand().getName(),
                
                variant.getModel().getId(),

                variant.getModel().getName(),
                
                variant.getModel().getThumbnail(),

                variant.getVariantName(),

                variant.getFuelType(),

                variant.getTransmission(),

                variant.getEngineCc(),

                variant.getPowerBhp(),

                variant.getTorqueNm(),

                variant.getMileageKmpl(),

                variant.getSeatingCapacity(),

                variant.getLengthMm(),

                variant.getWidthMm(),

                variant.getHeightMm(),

                variant.getWheelbaseMm(),

                variant.getBootSpaceLitres(),

                variant.getAirbags(),

                variant.getAbs(),

                variant.getEbd(),

                variant.getNcapRating(),

                variant.getBasePrice()
        );
    }
}