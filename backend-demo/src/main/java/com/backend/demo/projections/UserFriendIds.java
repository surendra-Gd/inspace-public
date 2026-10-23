package com.backend.demo.projections;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserFriendIds {
    private Long user1;
    private Long user2;

    public UserFriendIds(Long user1, Long user2) {
        this.user1 = user1;
        this.user2 = user2;
    }
}
