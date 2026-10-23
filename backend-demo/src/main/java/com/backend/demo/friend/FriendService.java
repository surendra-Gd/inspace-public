package com.backend.demo.friend;

import com.backend.demo.dto.UserDTO;
import com.backend.demo.friendrequest.FriendRequest;
import org.springframework.http.ResponseEntity;

import java.util.List;

public interface FriendService {
    Long addFriend(FriendRequest request);

    // get friends id by both users
    Long getFriendsIdByUserId(Long userId, Long frndId);

    ResponseEntity<?> getProfileInfo(Long userId);

    ResponseEntity<?> removeFriendship(Long friendsId);

    List<UserDTO> getUserFriends();
}
