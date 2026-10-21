package com.autocart.businessservice.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import com.autocart.businessservice.entity.CarModel;
import com.autocart.businessservice.entity.CarVariant;
import com.autocart.businessservice.entity.DealerInventory;
import com.autocart.businessservice.repository.DealerInventoryRepository;

@RestController
@RequestMapping("/api/internal")
public class InternalBusinessController {

    private final DealerInventoryRepository inventoryRepository;

    public InternalBusinessController(DealerInventoryRepository inventoryRepository) {
        this.inventoryRepository = inventoryRepository;
    }

    @GetMapping("/inventory/{id}/summary")
    @Transactional(readOnly = true)
    public ResponseEntity<Map<String, Object>> getInventorySummary(@PathVariable Long id) {
        DealerInventory inv = inventoryRepository.findById(id).orElse(null);
        if (inv == null) {
            return ResponseEntity.notFound().build();
        }

        Map<String, Object> map = new HashMap<>();
        map.put("inventoryId", inv.getId());
        map.put("dealerId", inv.getDealerId());
        map.put("unitsAvailable", inv.getUnitsAvailable());
        map.put("listedPrice", inv.getListedPrice());
        map.put("discountAmount", inv.getDiscountAmount() != null ? inv.getDiscountAmount() : java.math.BigDecimal.ZERO);

        CarVariant v = inv.getVariant();
        if (v != null) {
            map.put("variantId", v.getId());
            map.put("variantName", v.getVariantName() != null ? v.getVariantName() : "");
            CarModel m = v.getModel();
            if (m != null) {
                map.put("modelName", m.getName() != null ? m.getName() : "");
                if (m.getBrand() != null) {
                    map.put("brandName", m.getBrand().getName() != null ? m.getBrand().getName() : "");
                }
            }
        }

        return ResponseEntity.ok(map);
    }

    @PutMapping("/inventory/{id}/decrement-stock")
    @Transactional
    public ResponseEntity<Map<String, Object>> decrementStock(@PathVariable Long id) {
        DealerInventory inv = inventoryRepository.findById(id).orElse(null);
        if (inv == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("success", false, "error", "Inventory listing not found"));
        }

        int rows = inventoryRepository.decrementUnitsAvailable(id);
        if (rows == 0) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("success", false, "error", "Selected vehicle variant is out of stock."));
        }

        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("dealerId", inv.getDealerId());
        resp.put("inventoryId", id);
        return ResponseEntity.ok(resp);
    }

    @PutMapping("/inventory/{id}/increment-stock")
    @Transactional
    public ResponseEntity<Map<String, Object>> incrementStock(@PathVariable Long id) {
        inventoryRepository.incrementUnitsAvailable(id);
        return ResponseEntity.ok(Map.of("success", true, "inventoryId", id));
    }
}
