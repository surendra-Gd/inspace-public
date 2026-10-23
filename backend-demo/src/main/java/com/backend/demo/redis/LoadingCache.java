package com.backend.demo.redis;

import lombok.RequiredArgsConstructor;

import java.util.concurrent.TimeUnit;


import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;


@Service
@RequiredArgsConstructor
public class LoadingCache {

    private final RedisTemplate<String, Object> redisTemplate;

    /**
     * Checks if the given key is currently marked as loading.
     *
     * @param key the key to check
     * @return true if the key exists, otherwise false
     */
    public boolean isLoading(String key) {
        // Check if the key exists in Redis
        return Boolean.TRUE.equals(redisTemplate.hasKey(key));
    }

    /**
     * Marks the given key as loading in Redis with a TTL of 5 minutes.
     *
     * @param key the key to mark
     */
    public void markLoading(String key) {
        // Set the key with a value of "loading" and a TTL of 5 minutes
        redisTemplate.opsForValue().set(key, "loading", 5, TimeUnit.MINUTES);
    }

    /**
     * Clears the given key from Redis.
     *
     * @param key the key to clear
     */
    public void clear(String key) {
        // Remove the key from Redis
        redisTemplate.delete(key);
    }

    /**
     * Generates a cache key for a member's post upload operation.
     *
     * @param memberId the ID of the member
     * @return the generated cache key
     */
    public String getCacheKey(Long memberId) {
        // Use a colon as a separator for better organization of keys in Redis
        return memberId + ":upload-post";
    }
}