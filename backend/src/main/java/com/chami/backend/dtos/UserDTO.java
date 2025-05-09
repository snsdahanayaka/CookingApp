package com.chami.backend.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
    private Long id;
    private String username;
    private String email;
    private List<String> roles;
    
    // Additional user profile fields could be added here
    private String firstName;
    private String lastName;
    private String phoneNumber;
    private String address;
    // Add any other user profile fields as needed
}
