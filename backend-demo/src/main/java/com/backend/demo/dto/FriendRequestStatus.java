package com.backend.demo.dto;

import com.backend.demo.friendrequest.ProfileStatus;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class FriendRequestStatus {
    private Long requestId;
    private ProfileStatus profileStatus;
}

// DTO for friend request status in profile page
// DTO for action of friend request