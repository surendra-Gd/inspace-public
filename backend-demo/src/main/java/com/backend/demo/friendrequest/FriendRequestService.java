package com.backend.demo.friendrequest;

import com.backend.demo.dto.FriendRequestDTO;
import com.backend.demo.dto.FriendRequestStatus;
import com.backend.demo.spacerequest.Status;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface FriendRequestService {
    ResponseEntity<?> addFriendRequest(Long targetUserId);

    @Transactional
    void removeFriendRequest(Long requestId);

    // for profilePage Friend Request status
    FriendRequestStatus getProfileRequestStatus(Long userId);


    List<FriendRequestDTO> getOutgoingRequests(Long userId);

    List<FriendRequestDTO> getIncomingRequests(Long userId);

    @Transactional
    @Modifying
    ResponseEntity<?> handleFriendRequest(Long requestId, Status status);

    @Transactional
    @Modifying
    void setViewOnUnseenIncomingRequests();

}
