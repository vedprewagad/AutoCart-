package com.autocart.businessservice.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.autocart.businessservice.dto.ImageResponse;
import com.autocart.businessservice.entity.CarVariant;
import com.autocart.businessservice.entity.VariantImage;
import com.autocart.businessservice.exception.ResourceNotFoundException;
import com.autocart.businessservice.repository.CarVariantRepository;
import com.autocart.businessservice.repository.VariantImageRepository;
import com.autocart.businessservice.service.VariantImageService;

import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class VariantImageServiceImpl implements VariantImageService {

    private final CarVariantRepository carVariantRepository;
    private final VariantImageRepository variantImageRepository;

    public VariantImageServiceImpl(CarVariantRepository carVariantRepository,
                            VariantImageRepository variantImageRepository) {
        this.carVariantRepository = carVariantRepository;
        this.variantImageRepository = variantImageRepository;
    }

    @Override
    public List<ImageResponse> getImagesByVariant(Long variantId) {

        CarVariant variant = carVariantRepository.findById(variantId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Variant not found"));

        List<VariantImage> images = variantImageRepository.findByVariant(variant);

        return images.stream()
                .map(this::mapToImageResponse)
                .toList();
    }

    private ImageResponse mapToImageResponse(VariantImage image) {

        return new ImageResponse(

        	    image.getId(),

        	    image.getImageUrl(),

        	    image.getImageType(),

        	    image.getColourName()

       );
    }
}