package com.example.demo.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import com.example.demo.entity.Dealer;
import com.example.demo.entity.User;
import com.example.demo.repositories.DealerRepository;
import com.example.demo.repositories.UserRepository;

@RestController
@RequestMapping("/api/internal")
public class InternalAuthController {

    private final UserRepository userRepository;
    private final DealerRepository dealerRepository;

    public InternalAuthController(UserRepository userRepository, DealerRepository dealerRepository) {
        this.userRepository = userRepository;
        this.dealerRepository = dealerRepository;
    }

    @GetMapping("/users/{id}")
    @Transactional(readOnly = true)
    public ResponseEntity<Map<String, Object>> getUserSummary(@PathVariable Long id) {
        User user = userRepository.findById(id).orElse(null);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        Map<String, Object> map = new HashMap<>();
        map.put("id", user.getId());
        map.put("firstName", user.getFirstName() != null ? user.getFirstName() : "");
        map.put("lastName", user.getLastName() != null ? user.getLastName() : "");
        map.put("mobile", user.getMobile() != null ? user.getMobile() : "");
        map.put("email", user.getEmail() != null ? user.getEmail() : "");
        return ResponseEntity.ok(map);
    }

    @GetMapping("/dealers/{id}")
    @Transactional(readOnly = true)
    public ResponseEntity<Map<String, Object>> getDealerSummary(@PathVariable Long id) {
        Dealer dealer = dealerRepository.findById(id).orElse(null);
        if (dealer == null) {
            return ResponseEntity.notFound().build();
        }
        Map<String, Object> map = new HashMap<>();
        map.put("dealerId", dealer.getId());
        map.put("showroomName", dealer.getShowroomName() != null ? dealer.getShowroomName() : "");
        map.put("city", dealer.getCity() != null ? dealer.getCity() : "");
        map.put("state", dealer.getState() != null ? dealer.getState() : "");
        map.put("contactPhone", dealer.getContactPhone() != null ? dealer.getContactPhone() : "");
        map.put("rating", dealer.getRating() != null ? dealer.getRating() : 0.0);
        return ResponseEntity.ok(map);
    }

    @GetMapping("/dealers/user/{userId}")
    @Transactional(readOnly = true)
    public ResponseEntity<Map<String, Object>> getDealerByUserId(@PathVariable Long userId) {
        Dealer dealer = dealerRepository.findByUserId(userId).orElse(null);
        if (dealer == null || (dealer.getStatus() != null && dealer.getStatus() != com.example.demo.entity.DealerStatus.APPROVED)) {
            return ResponseEntity.notFound().build();
        }
        Map<String, Object> map = new HashMap<>();
        map.put("dealerId", dealer.getId());
        map.put("showroomName", dealer.getShowroomName() != null ? dealer.getShowroomName() : "");
        map.put("city", dealer.getCity() != null ? dealer.getCity() : "");
        map.put("state", dealer.getState() != null ? dealer.getState() : "");
        map.put("contactPhone", dealer.getContactPhone() != null ? dealer.getContactPhone() : "");
        map.put("rating", dealer.getRating() != null ? dealer.getRating() : 0.0);
        return ResponseEntity.ok(map);
    }

    @PutMapping("/dealers/{id}/rating")
    @Transactional
    public ResponseEntity<?> updateDealerRating(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        Dealer dealer = dealerRepository.findById(id).orElse(null);
        if (dealer == null) {
            return ResponseEntity.notFound().build();
        }
        Object rObj = body != null ? body.get("rating") : null;
        if (rObj != null) {
            float rating = Float.parseFloat(rObj.toString());
            dealer.setRating(rating);
            dealerRepository.save(dealer);
        }
        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("rating", dealer.getRating());
        return ResponseEntity.ok(resp);
    }
}
