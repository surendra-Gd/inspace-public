package com.backend.demo.dto;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
@AllArgsConstructor
public class MemberDTO {

    private Long memberId;
    private Long spaceId;
    private UserDTO user;
    private boolean isAdmin;
    private LocalDate joinedOn;
    private boolean isUserOnline;
    private int streak;
    private int lastStreak;
}

// DTO for space members inside ps
