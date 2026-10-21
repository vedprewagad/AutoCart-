package com.autocart.businessservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.autocart.businessservice.entity.TestDriveBooking;
import java.time.LocalDate;
import java.util.Collection;
import java.util.List;

public interface TestDriveBookingRepository extends JpaRepository<TestDriveBooking, Long> {
    List<TestDriveBooking> findByUserId(Long userId);
    List<TestDriveBooking> findByDealerId(Long dealerId);
    boolean existsByDealerIdAndVariant_IdAndPreferredDateAndPreferredTimeAndStatusNotIn(
            Long dealerId, Long variantId, LocalDate preferredDate, String preferredTime, Collection<String> statuses);
    boolean existsByUserIdAndDealerIdAndStatus(Long userId, Long dealerId, String status);
}
