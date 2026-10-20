package com.autocart.businessservice.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RatingResponse {
    private Long id;
    private Long userId;
    private Long dealerId;
    private String customerName;
    private Integer ratingValue;
    private String reviewText;
    private LocalDateTime createdAt;
}
