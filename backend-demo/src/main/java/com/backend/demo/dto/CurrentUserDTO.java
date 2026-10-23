package com.backend.demo.dto;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.ToString;

@Data
@ToString
@AllArgsConstructor
@Builder
public class CurrentUserDTO {
    private Long userId;
    private String username;
    private String name;
    private String email;
    private String profile;
    private String status;
}

// current user DTO