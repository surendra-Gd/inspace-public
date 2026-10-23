package com.backend.demo.dto;

import com.backend.demo.activity.Prompt;
import lombok.*;

import java.time.LocalDateTime;

@Data
public class ActivityDTO {

    private Long activityId;
    private UserDTO user;
    private Prompt prompt;
    private LocalDateTime timeStamp;

    public ActivityDTO(Long activityId,
                       Long userId,
                       String username,
                       String name,
                       String profile,
                       String status,
                       Prompt prompt,
                       LocalDateTime timeStamp) {
        this.activityId = activityId;
        this.user = new UserDTO(userId, username, name, profile, status);
        this.prompt = prompt;
        this.timeStamp = timeStamp;
    }
}

// activity inside ps