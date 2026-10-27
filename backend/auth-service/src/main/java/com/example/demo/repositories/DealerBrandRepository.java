package com.example.demo.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.demo.entity.DealerBrand;
import com.example.demo.entity.Dealer;
import java.util.List;

public interface DealerBrandRepository extends JpaRepository<DealerBrand, Long> {
    List<DealerBrand> findByDealer(Dealer dealer);
}
