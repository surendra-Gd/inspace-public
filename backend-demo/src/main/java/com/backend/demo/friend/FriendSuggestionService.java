package com.backend.demo.friend;

import com.backend.demo.common.PageResponse;
import com.backend.demo.dto.FriendRequestDTO;
import com.backend.demo.friendrequest.MutualRequests;

public interface FriendSuggestionService {
    MutualRequests getMutualRequests();

    PageResponse<FriendRequestDTO> getFriendsOfFriends(int page);
}
