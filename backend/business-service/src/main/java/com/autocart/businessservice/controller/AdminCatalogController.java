package com.autocart.businessservice.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.validation.annotation.Validated;
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
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.*;

@RestController
@RequestMapping("/api/admin/catalog")
@Validated
public class AdminCatalogController {

    private final BrandRepository brandRepository;
    private final CarModelRepository modelRepository;
    private final CarVariantRepository variantRepository;
    private final JdbcTemplate jdbcTemplate;

    @Autowired(required = false)
    private org.springframework.web.client.RestTemplate restTemplate;

    public AdminCatalogController(
            BrandRepository brandRepository,
            CarModelRepository modelRepository,
            CarVariantRepository variantRepository,
            @Autowired(required = false) JdbcTemplate jdbcTemplate) {
        this.brandRepository = brandRepository;
        this.modelRepository = modelRepository;
        this.variantRepository = variantRepository;
        this.jdbcTemplate = jdbcTemplate;
    }

    private boolean hasAssociatedTransactions(List<Long> variantIds) {
        if (variantIds == null || variantIds.isEmpty() || jdbcTemplate == null) {
            return false;
        }
        String inSql = String.join(",", Collections.nCopies(variantIds.size(), "?"));

        try {
            // 1. Check local dealer inventory
            Integer invCount = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM dealer_inventory WHERE variant_id IN (" + inSql + ")",
                    Integer.class, variantIds.toArray());
            if (invCount != null && invCount > 0) return true;

            // 2. Check local test drive bookings
            Integer tdCount = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM test_drive_bookings WHERE variant_id IN (" + inSql + ")",
                    Integer.class, variantIds.toArray());
            if (tdCount != null && tdCount > 0) return true;
        } catch (Exception ex) {
            // Ignore and proceed to standard JPA check
        }

        return false;
    }

    // --- BRANDS ---
    @PostMapping("/brands")
    public ResponseEntity<Brand> createBrand(@Valid @RequestBody Brand brand) {
        return ResponseEntity.ok(brandRepository.save(brand));
    }

    @org.springframework.transaction.annotation.Transactional
    @DeleteMapping("/brands/{id}")
    public ResponseEntity<?> deleteBrand(@PathVariable Long id) {
        if (!brandRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        List<CarModel> models = modelRepository.findByBrandId(id);
        List<Long> variantIds = new ArrayList<>();
        for (CarModel m : models) {
            List<CarVariant> variants = variantRepository.findByModelId(m.getId());
            for (CarVariant v : variants) {
                variantIds.add(v.getId());
            }
        }

        if (hasAssociatedTransactions(variantIds)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "Cannot delete brand: associated dealer inventory, bookings, or purchase enquiries exist."));
        }

        try {
            for (CarModel m : models) {
                variantRepository.deleteByModelId(m.getId());
            }
            modelRepository.deleteByBrandId(id);
            brandRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Brand deleted successfully"));
        } catch (org.springframework.dao.DataIntegrityViolationException dive) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "Cannot delete brand: foreign key constraint violation. Associated inventory, bookings or enquiries exist."));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "Error deleting brand: " + e.getMessage()));
        }
    }

    // --- MODELS ---
    @PostMapping("/models")
    public ResponseEntity<?> createModel(@Valid @RequestBody ModelRequest request) {
        if (request.getBodyType() == null || request.getBodyType().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "bodyType cannot be null or empty. Allowed values: " + Arrays.toString(BodyType.values())));
        }

        BodyType bodyType;
        try {
            bodyType = BodyType.valueOf(request.getBodyType().trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid bodyType '" + request.getBodyType() + "'. Allowed values: " + Arrays.toString(BodyType.values())));
        }

        Brand brand = brandRepository.findById(request.getBrandId())
                .orElseThrow(() -> new ResourceNotFoundException("Brand not found: " + request.getBrandId()));

        CarModel model = new CarModel();
        model.setBrand(brand);
        model.setName(request.getName());
        model.setBodyType(bodyType);
        model.setLaunchYear(request.getLaunchYear() != null ? request.getLaunchYear() : 2024);

        return ResponseEntity.ok(modelRepository.save(model));
    }

    @org.springframework.transaction.annotation.Transactional
    @DeleteMapping("/models/{id}")
    public ResponseEntity<?> deleteModel(@PathVariable Long id) {
        if (!modelRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        List<CarVariant> variants = variantRepository.findByModelId(id);
        List<Long> variantIds = variants.stream().map(CarVariant::getId).toList();

        if (hasAssociatedTransactions(variantIds)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "Cannot delete model: associated dealer inventory, bookings, or purchase enquiries exist for its variants."));
        }

        try {
            variantRepository.deleteByModelId(id);
            modelRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Model deleted successfully"));
        } catch (org.springframework.dao.DataIntegrityViolationException dive) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "Cannot delete model: foreign key constraint violation. Associated inventory or bookings exist."));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "Error deleting model: " + e.getMessage()));
        }
    }

    // --- VARIANTS ---
    @PostMapping("/variants")
    public ResponseEntity<?> createVariant(@Valid @RequestBody VariantRequest request) {
        if (request.getFuelType() == null || request.getFuelType().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "fuelType cannot be null or empty. Allowed values: " + Arrays.toString(FuelType.values())));
        }

        FuelType fuelType;
        try {
            fuelType = FuelType.valueOf(request.getFuelType().trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid fuelType '" + request.getFuelType() + "'. Allowed values: " + Arrays.toString(FuelType.values())));
        }

        if (request.getTransmission() == null || request.getTransmission().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "transmission cannot be null or empty. Allowed values: " + Arrays.toString(Transmission.values())));
        }

        Transmission transmission;
        try {
            transmission = Transmission.valueOf(request.getTransmission().trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid transmission '" + request.getTransmission() + "'. Allowed values: " + Arrays.toString(Transmission.values())));
        }

        CarModel model = modelRepository.findById(request.getModelId())
                .orElseThrow(() -> new ResourceNotFoundException("Model not found: " + request.getModelId()));

        CarVariant variant = new CarVariant();
        variant.setModel(model);
        variant.setVariantName(request.getVariantName());
        variant.setFuelType(fuelType);
        variant.setTransmission(transmission);
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
    public ResponseEntity<?> deleteVariant(@PathVariable Long id) {
        if (!variantRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        if (hasAssociatedTransactions(List.of(id))) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "Cannot delete variant: associated dealer inventory, bookings, or purchase enquiries exist."));
        }

        try {
            variantRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Variant deleted successfully"));
        } catch (org.springframework.dao.DataIntegrityViolationException dive) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "Cannot delete variant: foreign key constraint violation. Associated inventory or bookings exist."));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "Error deleting variant: " + e.getMessage()));
        }
    }

    @Getter
    @Setter
    public static class ModelRequest {
        @NotNull(message = "brandId is required")
        private Long brandId;

        @NotBlank(message = "name is required")
        private String name;

        @NotBlank(message = "bodyType is required")
        private String bodyType;

        private Integer launchYear;
    }

    @Getter
    @Setter
    public static class VariantRequest {
        @NotNull(message = "modelId is required")
        private Long modelId;

        @NotBlank(message = "variantName is required")
        private String variantName;

        @NotBlank(message = "fuelType is required")
        private String fuelType;

        @NotBlank(message = "transmission is required")
        private String transmission;

        @Positive(message = "engineCc must be positive")
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

        @NotNull(message = "basePrice is required")
        @Positive(message = "basePrice must be positive")
        private BigDecimal basePrice;
    }
}
