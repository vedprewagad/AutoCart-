package com.example.demo.repositories;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.example.demo.entity.Dealer;
import com.example.demo.entity.DealerStatus;
import com.example.demo.entity.User;

public interface DealerRepository extends JpaRepository<Dealer, Long> {

    boolean existsByGstNumber(String gstNumber);

    boolean existsByLicenseNumber(String licenseNumber);

    Optional<Dealer> findByUser(User user);

    List<Dealer> findByStatus(DealerStatus status);
}