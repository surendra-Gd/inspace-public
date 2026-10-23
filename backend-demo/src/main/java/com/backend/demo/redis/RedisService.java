package com.backend.demo.redis;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.listener.PatternTopic;
import org.springframework.data.redis.listener.RedisMessageListenerContainer;
import org.springframework.data.redis.listener.adapter.MessageListenerAdapter;
import org.springframework.stereotype.Service;

import javax.annotation.PreDestroy;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.atomic.AtomicInteger;

@Service
@RequiredArgsConstructor
@Slf4j
public class RedisService {

    private final RedisMessageListenerContainer redisContainer;
    private final MessageListenerAdapter listenerAdapter;
    private final RedisTemplate<String, Object> messageTemplate;

    // Map to store user-to-channel mappings
    private final ConcurrentHashMap<String, List<String>> userChannelsMap = new ConcurrentHashMap<>();
    // Map to track channel usage counts
    private final ConcurrentHashMap<String, AtomicInteger> channelUsageCount = new ConcurrentHashMap<>();

    /**
     * Subscribe a user to a channel.
     * @param userId The user ID.
     * @param channel The channel to subscribe to.
     */
    public void subscribeToChannel(String userId, String channel) {
        // Add the channel to the user's list
        userChannelsMap.compute(userId, (key, userChannels) -> {
            if (userChannels == null) {
                userChannels = new CopyOnWriteArrayList<>();
            }
            if (userChannels.contains(channel)) {
                return userChannels; // No need to proceed further
            }
            userChannels.add(channel);

            // Increment the channel usage count
            channelUsageCount.compute(channel, (ch, count) -> {
                if (count == null || count.get() == 0) {
                    subscribeToRedisChannel(channel); // Subscribe to Redis if this is the first user
                    return new AtomicInteger(1);
                } else {
                    count.incrementAndGet();
                    return count;
                }
            });
            return userChannels;
        });
    }

    /**
     * Unsubscribe a user from a channel.
     * @param userId The user ID.
     * @param channel The channel to unsubscribe from.
     */
    public void unsubscribeFromChannel(String userId, String channel) {
        userChannelsMap.computeIfPresent(userId, (key, userChannels) -> {
            if (!userChannels.contains(channel)) {
                log.warn("User {} is not subscribed to channel {}", userId, channel);
                return userChannels;
            }
            userChannels.remove(channel);

            // Decrement the channel usage count
            channelUsageCount.computeIfPresent(channel, (ch, count) -> {
                if (count.decrementAndGet() == 0) {
                    unsubscribeFromRedisChannel(channel); // Unsubscribe from Redis if no users are left
                    return null; // Remove channel from usage map
                }
                return count;
            });

            log.info("User {} unsubscribed from channel {}", userId, channel);
            return userChannels.isEmpty() ? null : userChannels; // Remove user if no channels remain
        });
    }

    /**
     * Publish a message to a channel.
     * @param channel The channel to publish to.
     * @param message The message to publish.
     */
    public void publishMessage(String channel, Object message) {
        try {
            messageTemplate.convertAndSend(channel, message);
            log.info("Published message to channel {}", channel);
        } catch (Exception e) {
            log.error("Failed to publish message to channel {}", channel, e);
        }
    }

    /**
     * Cleanup resources before shutdown.
     */
    @PreDestroy
    public void cleanup() {
        userChannelsMap.clear();
        channelUsageCount.forEach((channel, count) -> unsubscribeFromRedisChannel(channel));
        channelUsageCount.clear();
        log.info("Cleaned up Redis subscriptions");
    }



    private void subscribeToRedisChannel(String channel) {
        try {
            redisContainer.addMessageListener(listenerAdapter, new PatternTopic(channel));
            log.info("Subscribed to Redis channel: {}", channel);
        } catch (Exception e) {
            log.error("Failed to subscribe to Redis channel: {}", channel, e);
        }
    }

    private void unsubscribeFromRedisChannel(String channel) {
        try {
            redisContainer.removeMessageListener(listenerAdapter, new PatternTopic(channel));
            log.info("Unsubscribed from Redis channel: {}", channel);
        } catch (Exception e) {
            log.error("Failed to unsubscribe from Redis channel: {}", channel, e);
        }
    }
}