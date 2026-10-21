package com.autocart.transactionservice.controller;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

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

import com.autocart.transactionservice.repository.PurchaseEnquiryRepository;

@ExtendWith(MockitoExtension.class)
public class InternalTransactionControllerTest {

    private MockMvc mockMvc;

    @Mock
    private PurchaseEnquiryRepository purchaseEnquiryRepository;

    @InjectMocks
    private InternalTransactionController internalTransactionController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(internalTransactionController).build();
    }

    @Test
    @DisplayName("GET completed enquiry count returns 200 with count value")
    void testGetCompletedOrProcessedEnquiryCount() throws Exception {
        when(purchaseEnquiryRepository.countCompletedOrProcessedEnquiries(10L, 5L)).thenReturn(2L);

        mockMvc.perform(get("/api/internal/transactions/enquiries/user/10/dealer/5/completed-count")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.count").value(2));
    }
}
