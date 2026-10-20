package com.autocart.businessservice.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RatingRequest {
    private Long userId;
    private Long dealerId;
    private Integer ratingValue;
    private String reviewText;
}
