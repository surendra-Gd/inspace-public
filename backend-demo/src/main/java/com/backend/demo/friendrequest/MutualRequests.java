package com.backend.demo.friendrequest;

import com.backend.demo.dto.FriendRequestDTO;

import java.util.List;

public record MutualRequests(List<FriendRequestDTO> incomingRequests,
                             List<FriendRequestDTO> outgoingRequests) {

    @Override
    public String toString() {
        return "MutualRequests[ " +
                "incomingRequests=" + incomingRequests +
                ", outgoingRequests=" + outgoingRequests +
                " ]";
    }
}
