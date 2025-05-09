package com.chami.backend.services;

import com.chami.backend.dtos.UserDTO;

public interface UserService {
    UserDTO getUserProfile(Long userId);
    UserDTO updateUserProfile(Long userId, UserDTO userDTO);
    void deleteUser(Long userId);
    UserDTO getCurrentUser(String username);
}
