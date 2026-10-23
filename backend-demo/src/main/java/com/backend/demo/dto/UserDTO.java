package com.backend.demo.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserDTO {

    private Long userId;
    private String username;
    private String name;
    private String profile;
    private String status;

    public UserDTO(Long userId, String username, String name, String profile, String status) {
        this.userId = userId;
        this.username = username;
        this.name = name;
        this.profile = profile;
        this.status = status;
    }
}

// Every user DTO
