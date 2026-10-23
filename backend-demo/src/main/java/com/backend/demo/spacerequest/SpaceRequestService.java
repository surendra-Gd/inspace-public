package com.backend.demo.spacerequest;

import com.backend.demo.dto.SpaceRequestStatus;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.http.ResponseEntity;

public interface SpaceRequestService {
    SpaceRequestStatus addSpaceRequest(Long spaceId);

    @Transactional
    void removeSpaceRequest(Long requestId);

    ResponseEntity<?> getRequestsBySpaceId(Long spaceId);

    // Todo: some modifications want.
    ResponseEntity<SpaceRequestStatus> getRequestBySpaceIdAndUserId(Long spaceId);

    @Transactional
    @Modifying
    ResponseEntity<?> handleSpaceRequest(
            Long requestId, Status action, Long spaceId
    );

    ResponseEntity<?> getUnseenRequestsCount(Long spaceId);

    void updateUnseenSpaceRequests(Long spaceId);
}

