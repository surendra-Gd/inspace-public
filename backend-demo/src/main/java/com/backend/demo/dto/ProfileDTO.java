package com.backend.demo.dto;

import lombok.*;

@Data
@Builder
public class ProfileDTO {

    private Long friendsId;
    private UserDTO user;
    private boolean areFriends;
}

// DTO for initial profile reference