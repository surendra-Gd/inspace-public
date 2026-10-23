package com.backend.demo.friend;

import com.backend.demo.common.PageResponse;
import com.backend.demo.dto.DTOMapper;
import com.backend.demo.friendrequest.*;
import com.backend.demo.dto.FriendRequestDTO;
import com.backend.demo.user.User;
import com.backend.demo.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;



import java.util.List;

@Service
@RequiredArgsConstructor
public class FriendSuggestionServiceImpl implements FriendSuggestionService {
    private final FriendRepository friendsRepository;
    private final FriendRequestService friendRequestService;
    private final UserService userService;
    private final DTOMapper mapper;



    @Override
    public MutualRequests getMutualRequests() {
        Long userId = userService.currentUser().getUserId();
        List<FriendRequestDTO> incomingRequests = friendRequestService
                .getIncomingRequests(userId)
                .stream().toList();
        List<FriendRequestDTO> outgoingRequests = friendRequestService
                .getOutgoingRequests(userId)
                .stream().toList();
        return new MutualRequests(incomingRequests, outgoingRequests);
    }



    @Override
    public PageResponse<FriendRequestDTO> getFriendsOfFriends(int page) {
        Long userId = userService.currentUser().getUserId();
        Pageable pageable = PageRequest.of(page, 30);
        Page<User> friends = friendsRepository.findFriendsOfFriends(userId, pageable);
        List<FriendRequestDTO> response = friends.stream()
                .map(mapper::mapToUserDTO)
                .map(user -> new FriendRequestDTO(null, user, false))
                .toList();
        return new PageResponse<>(
                response,
                friends.getNumber(),
                friends.getTotalElements(),
                friends.getTotalPages(),
                friends.isFirst(),
                friends.isLast(),
                friends.hasNext(),
                friends.hasPrevious()
        );
    }

}