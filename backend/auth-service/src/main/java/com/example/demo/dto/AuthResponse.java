package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponse {

    private String token;
    private Long id;
    private Long dealerId;
    private String firstName;
    private String lastName;
    private String email;
    private String role;
    private String status;
    private String showroomName;
    private String gstNumber;
    private String licenseNumber;

    public AuthResponse(String token, Long id, Long dealerId, String firstName, String lastName, String email, String role, String status) {
        this.token = token;
        this.id = id;
        this.dealerId = dealerId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.role = role;
        this.status = status;
    }
}