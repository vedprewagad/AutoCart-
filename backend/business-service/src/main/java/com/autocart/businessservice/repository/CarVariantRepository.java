package com.autocart.businessservice.repository;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.autocart.businessservice.entity.CarModel;
import com.autocart.businessservice.entity.CarVariant;
import com.autocart.businessservice.entity.FuelType;

import com.autocart.businessservice.entity.BodyType;

@Repository
public interface CarVariantRepository extends JpaRepository<CarVariant, Long> {

    List<CarVariant> findByModel(CarModel model);

    Page<CarVariant> findAll(Pageable pageable);

    @Query(value = "SELECT DISTINCT v FROM CarVariant v " +
                   "JOIN FETCH v.model m JOIN FETCH m.brand b " +
                   "LEFT JOIN FETCH v.images " +
                   "WHERE (:brand IS NULL OR LOWER(b.name) = LOWER(:brand)) " +
                   "AND (:bodyType IS NULL OR m.bodyType = :bodyType) " +
                   "AND (:fuelType IS NULL OR v.fuelType = :fuelType) " +
                   "AND (:minPrice IS NULL OR v.basePrice >= :minPrice) " +
                   "AND (:maxPrice IS NULL OR v.basePrice <= :maxPrice) " +
                   "AND (:transmission IS NULL OR LOWER(v.transmission) = LOWER(:transmission))",
           countQuery = "SELECT COUNT(DISTINCT v) FROM CarVariant v " +
                        "JOIN v.model m JOIN m.brand b " +
                        "WHERE (:brand IS NULL OR LOWER(b.name) = LOWER(:brand)) " +
                        "AND (:bodyType IS NULL OR m.bodyType = :bodyType) " +
                        "AND (:fuelType IS NULL OR v.fuelType = :fuelType) " +
                        "AND (:minPrice IS NULL OR v.basePrice >= :minPrice) " +
                        "AND (:maxPrice IS NULL OR v.basePrice <= :maxPrice) " +
                        "AND (:transmission IS NULL OR LOWER(v.transmission) = LOWER(:transmission))")
    Page<CarVariant> findAllFiltered(Pageable pageable,
                                     @Param("brand") String brand,
                                     @Param("bodyType") BodyType bodyType,
                                     @Param("fuelType") FuelType fuelType,
                                     @Param("minPrice") BigDecimal minPrice,
                                     @Param("maxPrice") BigDecimal maxPrice,
                                     @Param("transmission") String transmission);

    List<CarVariant> findByModelId(Long modelId);

    void deleteByModelId(Long modelId);
}