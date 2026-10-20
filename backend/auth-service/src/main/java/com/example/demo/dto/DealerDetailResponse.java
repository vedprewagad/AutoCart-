package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DealerDetailResponse {
    private Long id;
    private Long userId;
    private String firstName;
    private String lastName;
    private String email;
    private String mobile;
    private String showroomName;
    private String licenseNumber;
    private String gstNumber;
    private String address;
    private String city;
    private String state;
    private String pinCode;
    private String contactPhone;
    private String workingHours;
    private String status;
    private Float rating;
    private Long brandId;
}
