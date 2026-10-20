package com.autocart.businessservice.controller;

import java.math.BigDecimal;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.autocart.businessservice.dto.VehiclePageResponse;
import com.autocart.businessservice.entity.BodyType;
import com.autocart.businessservice.entity.FuelType;
import com.autocart.businessservice.service.VehicleService;

@RestController
@RequestMapping("/api/vehicles")
public class VehicleController {

    private final VehicleService vehicleService;

    public VehicleController(VehicleService vehicleService) {
        this.vehicleService = vehicleService;
    }

    @GetMapping
    public ResponseEntity<VehiclePageResponse> getAllVehicles(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) BodyType bodyType,
            @RequestParam(required = false) FuelType fuelType,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) String transmission,
            @RequestParam(required = false) String sortBy) {

        VehiclePageResponse response = vehicleService.getAllVehicles(page, size, brand, bodyType, fuelType, minPrice, maxPrice, transmission, sortBy);

        return ResponseEntity.ok(response);
    }
}