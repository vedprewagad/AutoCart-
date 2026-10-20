package com.autocart.businessservice.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.autocart.businessservice.entity.CarVariant;
import com.autocart.businessservice.entity.VariantImage;

@Repository
public interface VariantImageRepository extends JpaRepository<VariantImage, Long> {

    List<VariantImage> findByVariant(CarVariant variant);

}