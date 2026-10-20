package com.autocart.businessservice.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.autocart.businessservice.entity.Brand;
import com.autocart.businessservice.entity.CarModel;

@Repository
public interface CarModelRepository extends JpaRepository<CarModel, Long> {

    List<CarModel> findByBrand(Brand brand);

    @Query("SELECT DISTINCT m FROM CarModel m LEFT JOIN FETCH m.variants WHERE m.brand = :brand")
    List<CarModel> findByBrandWithVariants(@Param("brand") Brand brand);

    @Query("SELECT DISTINCT m FROM CarModel m LEFT JOIN FETCH m.variants WHERE m.id = :id")
    Optional<CarModel> findByIdWithVariants(@Param("id") Long id);

    List<CarModel> findByBrandId(Long brandId);

    void deleteByBrandId(Long brandId);
}