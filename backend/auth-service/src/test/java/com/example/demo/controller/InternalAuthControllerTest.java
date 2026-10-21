package com.example.demo.controller;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import com.example.demo.entity.Dealer;
import com.example.demo.entity.User;
import com.example.demo.repositories.DealerRepository;
import com.example.demo.repositories.UserRepository;

@ExtendWith(MockitoExtension.class)
public class InternalAuthControllerTest {

    private MockMvc mockMvc;

    @Mock
    private UserRepository userRepository;

    @Mock
    private DealerRepository dealerRepository;

    @InjectMocks
    private InternalAuthController internalAuthController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(internalAuthController).build();
    }

    @Test
    @DisplayName("GET /api/internal/users/{id} returns 200 with user summary")
    void testGetUserSummary_Success() throws Exception {
        User user = new User();
        user.setId(10L);
        user.setFirstName("Alice");
        user.setLastName("Smith");
        user.setEmail("alice@autocart.com");
        user.setMobile("9876543210");

        when(userRepository.findById(10L)).thenReturn(Optional.of(user));

        mockMvc.perform(get("/api/internal/users/10")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(10))
                .andExpect(jsonPath("$.firstName").value("Alice"))
                .andExpect(jsonPath("$.lastName").value("Smith"))
                .andExpect(jsonPath("$.email").value("alice@autocart.com"))
                .andExpect(jsonPath("$.mobile").value("9876543210"));
    }

    @Test
    @DisplayName("GET /api/internal/dealers/{id} returns 200 with showroom details")
    void testGetDealerSummary_Success() throws Exception {
        Dealer dealer = new Dealer();
        dealer.setId(5L);
        dealer.setShowroomName("Apex Motors");
        dealer.setContactPhone("9123456780");
        dealer.setRating(4.5f);

        when(dealerRepository.findById(5L)).thenReturn(Optional.of(dealer));

        mockMvc.perform(get("/api/internal/dealers/5")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.dealerId").value(5))
                .andExpect(jsonPath("$.showroomName").value("Apex Motors"))
                .andExpect(jsonPath("$.rating").value(4.5));
    }

    @Test
    @DisplayName("GET /api/internal/dealers/user/{userId} returns 200 with dealer details by userId")
    void testGetDealerByUserId_Success() throws Exception {
        Dealer dealer = new Dealer();
        dealer.setId(5L);
        dealer.setShowroomName("Apex Motors");
        dealer.setContactPhone("9123456780");
        dealer.setRating(4.2f);

        when(dealerRepository.findByUserId(20L)).thenReturn(Optional.of(dealer));

        mockMvc.perform(get("/api/internal/dealers/user/20")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.dealerId").value(5))
                .andExpect(jsonPath("$.showroomName").value("Apex Motors"));
    }

    @Test
    @DisplayName("PUT /api/internal/dealers/{id}/rating updates dealer rating successfully")
    void testUpdateDealerRating_Success() throws Exception {
        Dealer dealer = new Dealer();
        dealer.setId(5L);
        dealer.setRating(4.0f);

        when(dealerRepository.findById(5L)).thenReturn(Optional.of(dealer));

        mockMvc.perform(put("/api/internal/dealers/5/rating")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"rating\": 4.8}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.rating").value(4.8));

        verify(dealerRepository).save(dealer);
    }
}
