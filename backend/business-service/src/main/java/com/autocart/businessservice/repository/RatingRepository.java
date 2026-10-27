package com.autocart.businessservice.repository;

import com.autocart.businessservice.entity.Rating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RatingRepository extends JpaRepository<Rating, Long> {

    Optional<Rating> findByUserIdAndDealerId(Long userId, Long dealerId);

    List<Rating> findByDealerIdOrderByCreatedAtDesc(Long dealerId);

    @Query("SELECT AVG(r.ratingValue) FROM Rating r WHERE r.dealerId = :dealerId")
    Double getAverageRatingForDealer(@Param("dealerId") Long dealerId);

    @Query("SELECT COUNT(r) FROM Rating r WHERE r.dealerId = :dealerId")
    Long countByDealerId(@Param("dealerId") Long dealerId);
}
