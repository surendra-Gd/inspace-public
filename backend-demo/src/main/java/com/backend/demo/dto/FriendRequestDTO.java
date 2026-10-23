package com.backend.demo.dto;

import lombok.Data;

@Data
public class FriendRequestDTO {

    private Long requestId;
    private UserDTO user;
    private boolean seen;

    public FriendRequestDTO(Long requestId, UserDTO user, boolean seen) {
        this.requestId = requestId;
        this.user = user;
        this.seen = seen;
    }

    public FriendRequestDTO(Long requestId, Long userId, String username, String name, String profile, String status, boolean seen) {
        this.requestId = requestId;
        this.user = new UserDTO(userId, username, name, profile, status);
        this.seen = seen;
    }
}

// DTO for mutual-requests and suggesting-users