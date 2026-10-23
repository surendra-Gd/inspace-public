package com.backend.demo.spacerequest;

import com.backend.demo.dto.AdminActionResponse;
import com.backend.demo.dto.SpaceRequestDTO;
import com.backend.demo.exception.*;
import com.backend.demo.dto.SpaceRequestStatus;
import com.backend.demo.member.MemberService;
import com.backend.demo.notification.NotificationService;
import com.backend.demo.notification.NotificationType;
import com.backend.demo.space.SpaceService;
import com.backend.demo.user.User;
import com.backend.demo.user.UserService;
import com.backend.demo.space.Space;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class SpaceRequestServiceImpl implements SpaceRequestService {

    private final SpaceService spaceService;
    private final UserService userService;
    private final SpaceRequestRepository spaceRequestRepository;
    private final MemberService memberService;
    private final NotificationService notificationService;


    @Override
    public SpaceRequestStatus addSpaceRequest(Long spaceId) {
        User requester = userService.currentUser();
        var existingRequestId = spaceRequestRepository
                .getProcessedRequest(requester.getUserId(), spaceId);
        if(existingRequestId.isPresent()) {
            throw new IncomingRequestFoundException(
                    "We found request to that space",
                    existingRequestId.get(),
                    "Space Request Found"
            );
        }
        Long existingMemberId = memberService.isUserAsMember(requester.getUserId(), spaceId);
        if(existingMemberId > 0L) {
            throw new EntityFoundException(
                    "You already member to that space",
                    existingMemberId,
                    "Space Member Exists"
            );
        }
        Space space = spaceService.getSpaceById(spaceId);
        SpaceRequest request = SpaceRequest.builder()
                .requestedBy(requester)
                .space(space)
                .requestedOn(LocalDateTime.now())
                .status(Status.PROCESS)
                .adminSeen(false)
                .build();
        var response = spaceRequestRepository.save(request);

        // Notification 🚩
        notificationService.notificationOnSpaceRequest(
                space.getAdmin().getUserId(), space.getUniqueId(),
                NotificationType.SPACE_REQUEST, requester.getProfileUrl()
        );

        return buildModel(response.getRequestId(), response.getStatus());
    }


    @Transactional
    @Override
    public void removeSpaceRequest(Long requestId) {
        Long userId = userService.getCurrentUser().getUserId();
        Optional<SpaceRequest> optionalRequest = spaceRequestRepository.findByRequestId(requestId);
        if(optionalRequest.isEmpty()) {
            throw new ResourceNotFoundException("Space Request Not Found");
        }
        SpaceRequest request = optionalRequest.get();
        if(!request.getRequestedBy().getUserId().equals(userId)) {
            throw new AccessDeniedException("UnAuthorized Access");
        }
        if(!request.getStatus().equals(Status.PROCESS)) {
            throw new OperationNotPermittedException("Request Used");
        }
        try {
            spaceRequestRepository.deleteByRequestId(requestId);
        } catch (Exception e) {
            throw new DatabaseOperationException(e.getMessage(),
                    "There is an error on removeSpaceRequest in SpaceRequestService by delete " +
                            "-P %s".formatted(requestId)
            );
        }
    }

    @Override
    public ResponseEntity<?> getRequestsBySpaceId(Long spaceId) {
        try {
            List<SpaceRequestDTO> response = spaceRequestRepository
                    .getProcessedRequestsBySpaceId(spaceId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            throw new DatabaseOperationException(e.getMessage(),
                    "There is an error on getRequestsBySpaceId in SpaceRequestService by get " +
                            "-P %s".formatted(spaceId)
            );
        }
    }


    // Todo: some modifications want.
    @Override
    public ResponseEntity<SpaceRequestStatus> getRequestBySpaceIdAndUserId(Long spaceId) {
        Long userId = userService.currentUser().getUserId();
        var optionalRequest = spaceRequestRepository
                .getRequestByUserIdAndSpaceId(userId, spaceId);

        if(optionalRequest.isPresent()) {
            Long requestId = optionalRequest.get();
            var response =  buildModel(requestId, Status.PROCESS);
            return ResponseEntity.ok(response);
        }
        boolean userIsMember = memberService.isUserAsMember(userId, spaceId) > 0;
        if(userIsMember) {
            var response = buildModel(null, Status.ACCEPT);
            return ResponseEntity.ok(response);
        }
        var response = buildModel(null, Status.DECLINE);
        return ResponseEntity.ok(response);
    }


    private SpaceRequestStatus buildModel(Long requestId, Status status) {
        return SpaceRequestStatus.builder()
                .requestId(requestId)
                .status(status)
                .build();
    }

    @Transactional
    @Modifying
    @Override
    public ResponseEntity<?> handleSpaceRequest(
            Long requestId, Status action, Long spaceId
    ) {
        Long userId = userService.currentUser().getUserId();
        SpaceRequest request = getRequestById(requestId);
        validateSpaceRequest(request, userId, spaceId);
        return switch (action) {
            case ACCEPT -> {
                var response = acceptTheSpaceRequest(request);
                yield ResponseEntity.ok(response);
            }
            case DECLINE -> {
                rejectTheRequest(request);
                yield ResponseEntity.ok(requestId);
            }
            default -> throw new InvalidCredentialsException("Invalid status provided");
        };
    }

    @Override
    public ResponseEntity<?> getUnseenRequestsCount(Long spaceId) {
        Space space = spaceService.getSpaceById(spaceId);
        Long userId = userService.getCurrentUser().getUserId();

        if(!space.getAdmin().getUserId().equals(userId)) return ResponseEntity.ok().build();
        Map<String, Object> response = new HashMap<>();
        int count = spaceRequestRepository.getUnseenRequestsCount(spaceId);
        response.put("spaceId", spaceId);
        response.put("count", count);
        return ResponseEntity.ok(response);
    }


    @Transactional
    @Modifying
    @Override
    public void updateUnseenSpaceRequests(Long spaceId) {
        Long userId = userService.getCurrentUser().getUserId();
        boolean isAdmin = spaceService.getSpaceById(spaceId)
                .getAdmin().getUserId().equals(userId);
        if(!isAdmin) return;
        spaceRequestRepository.updateUnseenRequests(spaceId);
    }

    private SpaceRequest getRequestById(Long requestId) {
        return spaceRequestRepository.findByRequestId(requestId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Space Request Not Found"
                ));
    }

    private void validateSpaceRequest(
            SpaceRequest request, Long userId, Long spaceId
    ) {
        Long admin = request.getSpace().getAdmin().getUserId();
        if (!request.getSpace().getSpaceId().equals(spaceId) || !userId.equals(admin)) {
            throw new AccessDeniedException("UnAuthorized Access");
        }
        if(request.getRequestedBy().getUserId().equals(userId)) {
            throw new OperationFailedException("Some thing went wrong");
        }
        if (!request.getStatus().equals(Status.PROCESS)) {
            throw new OperationFailedException("Request Used");
        }
    }


    private AdminActionResponse acceptTheSpaceRequest(SpaceRequest request) {
        User user = request.getRequestedBy();
        Space space = request.getSpace();
        var response = spaceService.acceptTheMember(user, space);

        // Notification 🚩
        notificationService.notificationOnSpaceRequest(
                request.getRequestedBy().getUserId(), space.getUniqueId(),
                NotificationType.ACCEPT_SPACE_REQUEST, space.getAdmin().getProfileUrl()
        );

        request.setStatus(Status.ACCEPT);
        request.setRequestedOn(LocalDateTime.now());
        return response;
    }


    private void rejectTheRequest(SpaceRequest request) {
        request.setStatus(Status.DECLINE);
        request.setRequestedOn(LocalDateTime.now());
        try {
            spaceRequestRepository.save(request);
        } catch (Exception e) {
            throw new DatabaseOperationException(e.getMessage(),
                    "There is an error occurred in rejectTheRequest in SpaceRequestService by save " +
                            "-P %s".formatted(request)
            );

        }
    }

}
