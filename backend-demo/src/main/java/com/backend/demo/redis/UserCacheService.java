package com.backend.demo.redis;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserCacheService {

    private final RedisTemplate<String, Object> redisTemplate;

    public void evictUserCache(String username) {
        redisTemplate.delete("userCache::" + username);
    }
}