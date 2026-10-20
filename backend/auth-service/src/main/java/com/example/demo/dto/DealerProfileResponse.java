package com.example.demo.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DealerProfileResponse extends UserProfileResponse {

    private String showroomName;

    private String gstNumber;

    private String licenseNumber;

    private String address;

    private String pinCode;

    private String contactPhone;

    private String workingHours;

    private Float rating;
}