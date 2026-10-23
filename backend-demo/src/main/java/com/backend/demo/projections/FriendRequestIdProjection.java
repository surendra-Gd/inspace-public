package com.backend.demo.projections;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FriendRequestIdProjection {

    private Long requestId;
    private Long requesterId;

    public FriendRequestIdProjection(Long requestId, Long requesterId) {
        this.requestId = requestId;
        this.requesterId = requesterId;
    }
}
