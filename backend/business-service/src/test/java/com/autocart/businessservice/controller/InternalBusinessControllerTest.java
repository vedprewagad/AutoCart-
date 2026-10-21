package com.autocart.businessservice.controller;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.math.BigDecimal;
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

import com.autocart.businessservice.entity.Brand;
import com.autocart.businessservice.entity.CarModel;
import com.autocart.businessservice.entity.CarVariant;
import com.autocart.businessservice.entity.DealerInventory;
import com.autocart.businessservice.repository.DealerInventoryRepository;

@ExtendWith(MockitoExtension.class)
public class InternalBusinessControllerTest {

    private MockMvc mockMvc;

    @Mock
    private DealerInventoryRepository inventoryRepository;

    @InjectMocks
    private InternalBusinessController internalBusinessController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(internalBusinessController).build();
    }

    @Test
    @DisplayName("GET /api/internal/inventory/{id}/summary returns 200 with inventory and car hierarchy")
    void testGetInventorySummary_Success() throws Exception {
        Brand brand = new Brand();
        brand.setName("Honda");

        CarModel model = new CarModel();
        model.setName("City");
        model.setBrand(brand);

        CarVariant variant = new CarVariant();
        variant.setId(101L);
        variant.setVariantName("City ZX");
        variant.setModel(model);

        DealerInventory inv = new DealerInventory();
        inv.setId(1L);
        inv.setDealerId(5L);
        inv.setUnitsAvailable(3);
        inv.setListedPrice(new BigDecimal("1450000.00"));
        inv.setVariant(variant);

        when(inventoryRepository.findById(1L)).thenReturn(Optional.of(inv));

        mockMvc.perform(get("/api/internal/inventory/1/summary")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.inventoryId").value(1))
                .andExpect(jsonPath("$.dealerId").value(5))
                .andExpect(jsonPath("$.unitsAvailable").value(3))
                .andExpect(jsonPath("$.modelName").value("City"))
                .andExpect(jsonPath("$.brandName").value("Honda"))
                .andExpect(jsonPath("$.variantName").value("City ZX"));
    }

    @Test
    @DisplayName("GET /api/internal/inventory/{id}/summary returns 404 when inventory not found")
    void testGetInventorySummary_NotFound() throws Exception {
        when(inventoryRepository.findById(999L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/internal/inventory/999/summary")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("PUT /api/internal/inventory/{id}/decrement-stock returns 200 when stock available")
    void testDecrementStock_Success() throws Exception {
        DealerInventory inv = new DealerInventory();
        inv.setId(1L);
        inv.setDealerId(5L);
        inv.setUnitsAvailable(2);

        when(inventoryRepository.findById(1L)).thenReturn(Optional.of(inv));
        when(inventoryRepository.decrementUnitsAvailable(1L)).thenReturn(1);

        mockMvc.perform(put("/api/internal/inventory/1/decrement-stock")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.dealerId").value(5))
                .andExpect(jsonPath("$.inventoryId").value(1));
    }

    @Test
    @DisplayName("PUT /api/internal/inventory/{id}/decrement-stock returns 409 CONFLICT when out of stock")
    void testDecrementStock_OutOfStock() throws Exception {
        DealerInventory inv = new DealerInventory();
        inv.setId(1L);
        inv.setDealerId(5L);
        inv.setUnitsAvailable(0);

        when(inventoryRepository.findById(1L)).thenReturn(Optional.of(inv));
        when(inventoryRepository.decrementUnitsAvailable(1L)).thenReturn(0);

        mockMvc.perform(put("/api/internal/inventory/1/decrement-stock")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("PUT /api/internal/inventory/{id}/increment-stock returns 200 on compensation")
    void testIncrementStock_Success() throws Exception {
        when(inventoryRepository.incrementUnitsAvailable(1L)).thenReturn(1);

        mockMvc.perform(put("/api/internal/inventory/1/increment-stock")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.inventoryId").value(1));
    }
}
