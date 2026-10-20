package com.autocart.businessservice.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.autocart.businessservice.entity.Brand;
import com.autocart.businessservice.entity.CarModel;
import com.autocart.businessservice.entity.CarVariant;
import com.autocart.businessservice.entity.BodyType;
import com.autocart.businessservice.entity.FuelType;
import com.autocart.businessservice.entity.Transmission;
import com.autocart.businessservice.repository.BrandRepository;
import com.autocart.businessservice.repository.CarModelRepository;
import com.autocart.businessservice.repository.CarVariantRepository;
import com.autocart.businessservice.exception.ResourceNotFoundException;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/admin/catalog")
public class AdminCatalogController {

    private final BrandRepository brandRepository;
    private final CarModelRepository modelRepository;
    private final CarVariantRepository variantRepository;

    public AdminCatalogController(
            BrandRepository brandRepository,
            CarModelRepository modelRepository,
            CarVariantRepository variantRepository) {
        this.brandRepository = brandRepository;
        this.modelRepository = modelRepository;
        this.variantRepository = variantRepository;
    }

    // --- BRANDS ---
    @PostMapping("/brands")
    public ResponseEntity<Brand> createBrand(@RequestBody Brand brand) {
        return ResponseEntity.ok(brandRepository.save(brand));
    }

    @org.springframework.transaction.annotation.Transactional
    @DeleteMapping("/brands/{id}")
    public ResponseEntity<String> deleteBrand(@PathVariable Long id) {
        try {
            java.util.List<CarModel> models = modelRepository.findByBrandId(id);
            for (CarModel m : models) {
                variantRepository.deleteByModelId(m.getId());
            }
            modelRepository.deleteByBrandId(id);
            brandRepository.deleteById(id);
            return ResponseEntity.ok("Brand deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error deleting brand: " + e.getMessage());
        }
    }

    // --- MODELS ---
    @PostMapping("/models")
    public ResponseEntity<CarModel> createModel(@RequestBody ModelRequest request) {
        Brand brand = brandRepository.findById(request.getBrandId())
                .orElseThrow(() -> new ResourceNotFoundException("Brand not found: " + request.getBrandId()));

        CarModel model = new CarModel();
        model.setBrand(brand);
        model.setName(request.getName());
        model.setBodyType(BodyType.valueOf(request.getBodyType().toUpperCase()));
        model.setLaunchYear(request.getLaunchYear() != null ? request.getLaunchYear() : 2024);

        return ResponseEntity.ok(modelRepository.save(model));
    }

    @org.springframework.transaction.annotation.Transactional
    @DeleteMapping("/models/{id}")
    public ResponseEntity<String> deleteModel(@PathVariable Long id) {
        try {
            variantRepository.deleteByModelId(id);
            modelRepository.deleteById(id);
            return ResponseEntity.ok("Model deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error deleting model: " + e.getMessage());
        }
    }

    // --- VARIANTS ---
    @PostMapping("/variants")
    public ResponseEntity<CarVariant> createVariant(@RequestBody VariantRequest request) {
        CarModel model = modelRepository.findById(request.getModelId())
                .orElseThrow(() -> new ResourceNotFoundException("Model not found: " + request.getModelId()));

        CarVariant variant = new CarVariant();
        variant.setModel(model);
        variant.setVariantName(request.getVariantName());
        variant.setFuelType(FuelType.valueOf(request.getFuelType().toUpperCase()));
        variant.setTransmission(Transmission.valueOf(request.getTransmission().toUpperCase()));
        variant.setEngineCc(request.getEngineCc());
        variant.setPowerBhp(request.getPowerBhp());
        variant.setTorqueNm(request.getTorqueNm());
        variant.setMileageKmpl(request.getMileageKmpl());
        variant.setSeatingCapacity(request.getSeatingCapacity() != null ? request.getSeatingCapacity() : 5);
        variant.setLengthMm(request.getLengthMm());
        variant.setWidthMm(request.getWidthMm());
        variant.setHeightMm(request.getHeightMm());
        variant.setWheelbaseMm(request.getWheelbaseMm());
        variant.setBootSpaceLitres(request.getBootSpaceLitres());
        variant.setAirbags(request.getAirbags() != null ? request.getAirbags() : 6);
        variant.setAbs(request.getAbs() != null ? request.getAbs() : true);
        variant.setEbd(request.getEbd() != null ? request.getEbd() : true);
        variant.setNcapRating(request.getNcapRating() != null ? request.getNcapRating() : "Not Tested");
        variant.setBasePrice(request.getBasePrice());

        return ResponseEntity.ok(variantRepository.save(variant));
    }

    @org.springframework.transaction.annotation.Transactional
    @DeleteMapping("/variants/{id}")
    public ResponseEntity<String> deleteVariant(@PathVariable Long id) {
        try {
            variantRepository.deleteById(id);
            return ResponseEntity.ok("Variant deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error deleting variant: " + e.getMessage());
        }
    }

    @Getter
    @Setter
    public static class ModelRequest {
        private Long brandId;
        private String name;
        private String bodyType;
        private Integer launchYear;
    }

    @Getter
    @Setter
    public static class VariantRequest {
        private Long modelId;
        private String variantName;
        private String fuelType;
        private String transmission;
        private Integer engineCc;
        private Float powerBhp;
        private Float torqueNm;
        private Float mileageKmpl;
        private Integer seatingCapacity;
        private Integer lengthMm;
        private Integer widthMm;
        private Integer heightMm;
        private Integer wheelbaseMm;
        private Integer bootSpaceLitres;
        private Integer airbags;
        private Boolean abs;
        private Boolean ebd;
        private String ncapRating;
        private BigDecimal basePrice;
    }
}
