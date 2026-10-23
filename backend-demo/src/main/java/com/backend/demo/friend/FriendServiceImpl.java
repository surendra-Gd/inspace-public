package com.backend.demo.friend;

import com.backend.demo.dto.SpaceDTO;
import com.backend.demo.exception.AccessDeniedException;
import com.backend.demo.exception.DatabaseOperationException;
import com.backend.demo.exception.ResourceNotFoundException;
import com.backend.demo.friendrequest.FriendRequest;
import com.backend.demo.dto.*;
import com.backend.demo.member.MemberService;
import com.backend.demo.projections.UserFriendIds;
import com.backend.demo.user.User;
import com.backend.demo.user.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class FriendServiceImpl implements FriendService {

    private final FriendRepository friendsRepository;
    private final DTOMapper mapper;
    private final UserService userService;
    private final MemberService memberService;

    public FriendServiceImpl(FriendRepository friendsRepository,
                             DTOMapper mapper,
                             UserService userService,
                             MemberService memberService) {
        this.friendsRepository = friendsRepository;
        this.mapper = mapper;
        this.userService = userService;
        this.memberService = memberService;
    }

    @Override
    public Long addFriend(FriendRequest request) {
        User user1 = request.getRequestTo();
        User user2 = request.getRequester();
        // Ensure user1 is always less than or equal to user2
        if (user1.getUserId() > user2.getUserId()) {
            User temp = user1;
            user1 = user2;
            user2 = temp;
        }
        Friend friend = Friend.builder()
                .user1(user1)
                .user2(user2)
                .build();
        try {
            return friendsRepository.save(friend).getFriendsId();
        } catch (Exception e) {
            throw new DatabaseOperationException(e.getMessage(),
                    "There is error on addFriend method save operation -P %s".formatted(friend.toString())
            );
        }
    }


    public List<UserDTO> getAllFriendsById(Long userId) {
        try {
            List<UserDTO> friends = friendsRepository.findFriendUsersByUserId(userId)
                    .stream().filter(u -> !u.getUserId().equals(userId))
                    .toList();
            if (friends.isEmpty()) return List.of();
            return friends;
        } catch (Exception e) {
            throw new DatabaseOperationException(e.getMessage(),
                    "There is error on getAllFriendsById in FriendService on get operation -P %s".formatted(userId)
            );
        }
    }


    @Override
    public Long getFriendsIdByUserId(Long userId, Long friendId) {
        try {
            return friendsRepository.getFriendsIdByUserId(userId, friendId)
                    .orElse(null);
        } catch (Exception e) {
            throw new DatabaseOperationException(e.getMessage(),
                    "There is an error on getFriendsIdByUserId in FriendService on get operation -P %s,%s".formatted(userId, friendId)
            );
        }
    }

    @Override
    public ResponseEntity<?> getProfileInfo(Long userId) {
        try {
            List<SpaceDTO> spaces = memberService.getSpaceByMemberUserId(userId).stream()
                    .map(mapper::mapToSpaceDTO)
                    .toList();
            List<UserDTO> friends = getAllFriendsById(userId);
            ProfileInfo profile = mapper.mapToProfileInfo(friends, spaces);
            return ResponseEntity.ok(profile);
        } catch (Exception e) {
            throw new DatabaseOperationException(e.getMessage(),
                    "There is an error on getProfileInfo in FriendService on get operation -P %s".formatted(userId)
            );
        }
    }


    @Override
    public ResponseEntity<?> removeFriendship(Long friendsId) {
        Long currentUser = userService.getCurrentUser().getUserId();
        Optional<UserFriendIds> optionalFriend = getFriendsById(friendsId);

        if (optionalFriend.isEmpty()) {
            throw new ResourceNotFoundException("Friends not Found");
        }

        var friends = optionalFriend.get();
        Long user1 = friends.getUser1();
        Long user2 = friends.getUser2();

        if (!user1.equals(currentUser) && !user2.equals(currentUser)) {
            throw new AccessDeniedException("UnAuthorized Access");
        }

        try {
            friendsRepository.deleteByFriendsId(friendsId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            throw new DatabaseOperationException(e.getMessage(),
                   "There is an error on removeFriendShip in FriendService on delete operation -P %s".formatted(friendsId)
            );
        }
    }

    private Optional<UserFriendIds> getFriendsById(Long friendsId) {
        try {
            return friendsRepository.findByFriendsId(friendsId);
        } catch (Exception e) {
            throw new DatabaseOperationException(e.getMessage(),
                    "There is an error on getFriendsById in FriendService on get operation -P %s".formatted(friendsId)
            );
        }
    }

    @Override
    public List<UserDTO> getUserFriends() {
        Long userId = userService.currentUser().getUserId();
        return getAllFriendsById(userId);
    }
}