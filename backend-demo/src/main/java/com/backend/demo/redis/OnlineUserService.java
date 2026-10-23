package com.backend.demo.redis;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class OnlineUserService {

    private static final String ONLINE_USERS_KEY_PREFIX = "user_online_status:";


    private final RedisTemplate<String, Object> redisTemplate;

    /**
     * Marks a user as online in a specific space.
     */
    public void markUserOnline(Long userId) {
        redisTemplate.opsForSet().add(ONLINE_USERS_KEY_PREFIX, userId);
    }

    /**
     * Marks a user as offline in a specific space.
     */
    public void markUserOffline(Long userId) {
        redisTemplate.opsForSet().remove(ONLINE_USERS_KEY_PREFIX, userId);
    }

    /**
     * Checks if a user is online in a specific space.
     */
    public boolean isUserOnline(Long userId) {
        return Boolean.TRUE.equals(
                redisTemplate.opsForSet().isMember(ONLINE_USERS_KEY_PREFIX, userId)
        );
    }

}