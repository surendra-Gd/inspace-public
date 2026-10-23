package com.backend.demo.payload;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
public class UserStatusPayload {
    private Action action;
    private Long userId;
    private UserStatus status;
    private String profileUrl;
    private String username;
}
