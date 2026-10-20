package com.example.demo.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserProfileResponse {

    private Long id;

    private Long dealerId;

    private String firstName;

    private String lastName;

    private String email;

    private String mobile;

    private String city;

    private String state;

    private String role;

    private String status;

    // Returned by /auth/me so the frontend can re-hydrate the JWT token
    // in Redux state after a page refresh (avoids re-login)
    private String token;
}