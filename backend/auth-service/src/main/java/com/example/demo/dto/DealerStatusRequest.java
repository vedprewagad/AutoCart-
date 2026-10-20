package com.example.demo.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DealerStatusRequest {
    private String status; // APPROVED or REJECTED
    private String rejectionReason;
}
