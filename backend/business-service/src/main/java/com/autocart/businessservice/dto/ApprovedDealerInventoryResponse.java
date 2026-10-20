package com.autocart.businessservice.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ApprovedDealerInventoryResponse {
    private Long id;
    private Long dealerId;
    private Long variantId;
    private BigDecimal listedPrice;
    private BigDecimal discountAmount;
    private String discountType;
    private Integer unitsAvailable;
    private Integer deliveryDays;
    private List<String> offers;
    private String showroomName;
    private String city;
    private String state;
    private String contactPhone;
    private Double rating;
}
