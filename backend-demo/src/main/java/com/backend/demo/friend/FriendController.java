package com.backend.demo.friend;


import com.backend.demo.dto.UserDTO;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/v1/friends")
@RequiredArgsConstructor
public class FriendController {

    private final FriendService friendService;
    private final FriendSuggestionService suggestionService;


    @GetMapping("/current")
    public List<UserDTO> getUserFriends() {
        return friendService.getUserFriends();
    }


    @GetMapping("/{userId}/profile")
    public ResponseEntity<?> getProfileInfo(
            @PathVariable("userId") @Min(1) Long userId
    ) {
        return friendService.getProfileInfo(userId);
    }


    @GetMapping("/suggestions")
    public ResponseEntity<?> getAllFriendSuggestions(
            @RequestParam(defaultValue = "0") @Min(0) int page
    ) {
        var response = suggestionService.getFriendsOfFriends(page);
        return ResponseEntity.ok(response);
    }


    @DeleteMapping("/{friendsId}")
    public ResponseEntity<?> unFriend(
            @PathVariable("friendsId") @Min(1) Long friendshipId
    ) {
        return friendService.removeFriendship(friendshipId);
    }
}
