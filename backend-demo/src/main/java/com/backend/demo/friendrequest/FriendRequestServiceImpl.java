package com.backend.demo.friendrequest;

import com.backend.demo.dto.FriendRequestDTO;
import com.backend.demo.exception.*;
import com.backend.demo.friend.FriendService;
import com.backend.demo.dto.FriendRequestStatus;
import com.backend.demo.notification.NotificationService;
import com.backend.demo.notification.NotificationType;
import com.backend.demo.projections.FriendRequestIdProjection;
import com.backend.demo.spacerequest.Status;
import com.backend.demo.user.User;
import com.backend.demo.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;


@Service
@RequiredArgsConstructor
public class FriendRequestServiceImpl implements FriendRequestService {

    private final UserService userService;
    private final FriendRequestRepository requestRepository;
    private final FriendService friendService;
    private final NotificationService notificationService;


    @Override
    public ResponseEntity<?> addFriendRequest(Long targetUserId) {
        User currentUser = userService.currentUser();
        validateFriendRequest(currentUser.getUserId(), targetUserId);

        User targetUser = userService.getUserById(targetUserId);
        FriendRequest newRequest = FriendRequest.builder()
                .requester(currentUser)
                .requestTo(targetUser)
                .requestOn(LocalDateTime.now())
                .status(Status.PROCESS)
                .targetUserSeen(false)
                .build();

        try {
            Long newRequestId = requestRepository.save(newRequest).getRequestId();

            // Notification 🚩
            notificationService.notificationOnFriendRequests(
                    currentUser, targetUserId, NotificationType.INCOMING_REQUEST
            );

            return ResponseEntity.ok(newRequestId);
        } catch (Exception e) {
            throw new DatabaseOperationException(e.getMessage(),
                    "There is an error occurred in addFriendRequest on FriendRequestService at save" +
                            " -P %s".formatted(newRequest.toString())
            );
        }
    }


    private void validateFriendRequest(Long userId, Long targetUserId) {
        if(userId.equals(targetUserId)) {
            throw new OperationNotPermittedException(
                    "You cannot send friend request to yourself"
            );
        }

        Optional<FriendRequestIdProjection> existingRequest = requestRepository
                .findRequestsByBothUsers(userId, targetUserId);

        existingRequest.ifPresent(request -> {
            Long requesterId = request.getRequesterId();
            Long requestId = request.getRequestId();

            if (requesterId.equals(userId)) {
                throw new EntityFoundException(
                        "Error: You already send friend request to that user",
                        requestId,
                        "Outgoing Request Found"
                );
            } else if (requesterId.equals(targetUserId)) {
                throw new IncomingRequestFoundException(
                        "Error: Incoming request already exists",
                        requestId,
                        "Incoming Request Found"
                );
            }
        });

        // Check if users are already friends
        Long friendId = friendService.getFriendsIdByUserId(targetUserId, userId);
        if (friendId != null) {
            throw new EntityFoundException(
                    "You and that user are already friends",
                    friendId,
                    "Friends Found"
            );
        }
    }

    @Transactional
    @Override
    public void removeFriendRequest(Long requestId) {
        Long userId = userService.getCurrentUser().getUserId();
        Optional<FriendRequest> optionalRequest = requestRepository.findByRequestId(requestId);
        if(optionalRequest.isEmpty()) {
            throw new ResourceNotFoundException("Friend Request not Found");
        }
        FriendRequest request = optionalRequest.get();
        if(!request.getRequester().getUserId().equals(userId)) {
            throw new AccessDeniedException("UnAuthorized Access");
        }
        if(!request.getStatus().equals(Status.PROCESS)) {
            throw new OperationNotPermittedException("Request Used");
        }
        try {
            requestRepository.deleteById(requestId);
        } catch (Exception e) {
            throw new DatabaseOperationException(e.getMessage(),
                    "There is an error occurred on removeFriendRequest in FriendRequestService by delete " +
                            "-P %s".formatted(requestId)
            );
        }
    }



    // for profilePage Friend Request status
    @Override
    public FriendRequestStatus getProfileRequestStatus(Long userId) {
        Long currentUser = userService.currentUser().getUserId();
        Long requestFromCurrentUser = getRequestByIds(currentUser, userId);
        if(requestFromCurrentUser != null)
            return build(requestFromCurrentUser, "OUTGOING");
        Long requestToCurrentUser = getRequestByIds(userId, currentUser);
        if(requestToCurrentUser != null)
            return build(requestToCurrentUser,"INCOMING");

        return build(null,"NO_REQUEST");
    }


    private Long getRequestByIds(Long requester, Long requestTo) {
        try {
            return requestRepository
                    .findRequestsByIds(requester, requestTo)
                    .orElse(null);
        } catch (Exception e)  {
            throw new DatabaseOperationException(e.getMessage(),
                    "There is an error occurred in getRequestByIds on FriendRequestService by get " +
                            "-P %s, %s".formatted(requester, requestTo)
            );
        }
    }


    private FriendRequestStatus build(Long requestId, String status) {
        return FriendRequestStatus.builder()
                .requestId(requestId)
                .profileStatus(ProfileStatus.valueOf(status))
                .build();
    }



    @Override
    public List<FriendRequestDTO> getOutgoingRequests(Long userId) {
        try {
            List<FriendRequestDTO> outgoingRequests = requestRepository
                    .getAllOutgoingRequestsByUserId(userId);
            if (outgoingRequests.isEmpty()) return List.of();
            return outgoingRequests;
        } catch (Exception e) {
            throw new DatabaseOperationException(e.getMessage(),
                    "There is an error occurred in getOutgoingRequest in FriendRequestService by get" +
                            " -P %s".formatted(userId)
            );
        }
    }



    @Override
    public List<FriendRequestDTO> getIncomingRequests(Long userId) {
        try {
            List<FriendRequestDTO> incomingRequests = requestRepository
                    .getAllIncomingRequestsByUserId(userId);
            if (incomingRequests.isEmpty()) return List.of();
            return incomingRequests;
        } catch (Exception e) {
            throw new DatabaseOperationException(e.getMessage(),
                    "There is an error occurred in getIncomingRequests in FriendRequestService by get " +
                            "-P %s".formatted(userId)
            );
        }
    }

    @Transactional
    @Modifying
    @Override
    public ResponseEntity<?> handleFriendRequest(Long requestId, Status status) {
        Long userId = userService.currentUser().getUserId();
        FriendRequest request = getRequestById(requestId);
        validateRequest(request, userId);
        return switch (status) {
            case ACCEPT -> {
                Long friendId = acceptTheRequest(request);
                yield ResponseEntity.ok(friendId);
            }
            case DECLINE -> {
                rejectTheRequest(request);
                yield ResponseEntity.ok(requestId);
            }
            default -> throw new InvalidCredentialsException("Invalid Status");
        };
    }

    private FriendRequest getRequestById(Long requestId) {
        try {
            return requestRepository.findByRequestId(requestId)
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Friend Request not Found"
                    ));
        } catch (Exception e) {
            throw new DatabaseOperationException(e.getMessage(),
                    "There is an error occurred in getRequestById in FriendRequest by get" +
                            " -P %s".formatted(requestId)
            );
        }
    }

    private void validateRequest(FriendRequest request, Long userId) {
        if (!userId.equals(request.getRequestTo().getUserId())) {
            throw new AccessDeniedException(
                    "UnAuthorized Access"
            );
        }
        if (!request.getStatus().equals(Status.PROCESS)) {
            throw new InvalidCredentialsException("Request Used");
        }
    }

    private Long acceptTheRequest(FriendRequest request) {
        Long friendId = friendService.addFriend(request);
        request.setStatus(Status.ACCEPT);
        try {
            requestRepository.save(request);

            // Notification 🚩
            notificationService.notificationOnFriendRequests(
                    request.getRequestTo(), request.getRequester().getUserId(),
                    NotificationType.ACCEPT_REQUEST
            );

            return friendId;
        } catch (Exception e) {
            throw new DatabaseOperationException(e.getMessage(),
                    "There is an error occurred in acceptRequest in FriendRequestService by save " +
                            "-P %s".formatted(request.toString())
            );
        }
    }

    private void rejectTheRequest(FriendRequest request) {
        try {
            request.setStatus(Status.DECLINE);
            requestRepository.save(request);
        } catch (Exception e) {
            throw new DatabaseOperationException(e.getMessage(),
                    "There is an error occurred in rejectTheRequest in FriendRequestService by save " +
                            "-P %s".formatted(request.toString())
            );
        }
    }

    @Transactional
    @Modifying
    @Override
    public void setViewOnUnseenIncomingRequests() {
        Long userId = userService.getCurrentUser().getUserId();
        requestRepository.setViewOnUnseenIncomingRequests(userId);
    }

}