package com.backend.demo.dto;

import com.backend.demo.spacerequest.Status;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
public class SpaceRequestDTO {

    private Long requestId;
    private UserDTO user;
    private LocalDateTime requestOn;
    private Status status;
    private boolean seen;

    public SpaceRequestDTO(Long requestId,
                           Status status,
                           LocalDateTime requestOn,
                           Long userId,
                           String username,
                           String name,
                           String profile,
                           String profileStatus,
                           boolean seen
    ) {
        this.requestId = requestId;
        this.user = new UserDTO(userId, username, name, profile, profileStatus);
        this.status = status;
        this.requestOn = requestOn;
        this.seen = seen;
    }
}

// DTO for reference to request(activity page) inside ps
