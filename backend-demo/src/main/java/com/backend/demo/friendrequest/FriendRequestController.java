package com.backend.demo.friendrequest;

import com.backend.demo.dto.HandleFriendRequestDTO;
import com.backend.demo.friend.FriendSuggestionService;
import com.backend.demo.dto.FriendRequestStatus;
import com.backend.demo.spacerequest.Status;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/v1/friend-requests")
@RequiredArgsConstructor
public class FriendRequestController {

    private final FriendRequestService requestService;
    private final FriendSuggestionService suggestionService;


    @PostMapping("/add/{userId}")
    public ResponseEntity<?> addRequest(
            @PathVariable("userId") @Min(1) Long targetUserId
    ) {
        return requestService.addFriendRequest(targetUserId);
    }


    @DeleteMapping("/remove/{id}")
    public ResponseEntity<?> removeRequest(
            @PathVariable("id") @Min(1) Long requestId
    ) {
        requestService.removeFriendRequest(requestId);
        return ResponseEntity.ok().build();
    }


    @PostMapping("handle")
    public ResponseEntity<?> handleRequest(
            @Valid @RequestBody HandleFriendRequestDTO request
    ) {
        Status status;
        try {
            status = Status.valueOf(request.getAction().toUpperCase());
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body("Invalid action: " + request.getAction());
        }
        return requestService.handleFriendRequest(request.getTargetId(), status);
    }


    @GetMapping("/status/{userId}")
    public ResponseEntity<?> getRequestStatus(
            @PathVariable("userId") @Min(1) Long userId
    ) {
        FriendRequestStatus profile = requestService.getProfileRequestStatus(userId);
        return ResponseEntity.ok(profile);
    }


    @GetMapping("mutual")
    public ResponseEntity<?> getMutualFriendRequests() {
        var response = suggestionService.getMutualRequests();
        return ResponseEntity.ok(response);
    }

    @PutMapping("/seen")
    public ResponseEntity<?> updateSeenOnIncomingRequests() {
        requestService.setViewOnUnseenIncomingRequests();
        return ResponseEntity.ok().build();
    }
}