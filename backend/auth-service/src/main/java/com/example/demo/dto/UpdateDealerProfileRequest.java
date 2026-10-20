package com.example.demo.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateDealerProfileRequest extends UpdateUserProfileRequest {

    private String showroomName;

    private String address;

    private String pinCode;

    private String contactPhone;

    private String workingHours;
}