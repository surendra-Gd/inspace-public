package com.backend.demo.websocket;

import com.backend.demo.exception.AccessDeniedException;
import com.backend.demo.payload.SpaceChannels;
import com.backend.demo.redis.RedisService;
import com.backend.demo.user.User;
import com.backend.demo.payload.PayloadMapper;
import com.backend.demo.payload.UserStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;


import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class WebSocketService {

    private final RedisService redisService;
    private final PayloadMapper payloadMapper;
    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Validates the session attributes.
     *
     * @param sessionAttributes the session attributes to validate.
     * @return the validated session attributes.
     * @throws IllegalArgumentException if the session attributes are null or empty.
     */
    private Map<String, Object> validateSessionAttributes(Map<String, Object> sessionAttributes) {
        if (sessionAttributes == null || sessionAttributes.isEmpty()) {
            throw new IllegalArgumentException("Session attributes are missing or invalid.");
        }
        return sessionAttributes;
    }


    /**
     * Retrieves the user from the session attributes.
     *
     * @param sessionAttributes the session attributes containing user information.
     * @return the authenticated user.
     * @throws IllegalArgumentException if user authentication is missing.
     */
    public User getUserFromSession(Map<String, Object> sessionAttributes) {
        var validatedSession = validateSessionAttributes(sessionAttributes);
        var authentication = (Authentication) validatedSession.get("user");
        if (authentication != null) {
            return (User) authentication.getPrincipal();
        }
        throw new IllegalArgumentException("User authentication is missing in session. Please reopen the app!");
    }

    /**
     * Retrieves space information from the session attributes.
     *
     * @param sessionAttributes the session attributes containing space information.
     * @return the space information as a map.
     * @throws IllegalArgumentException if space information is missing or empty.
     */
    public Map<String, Object> getSpaceInfoFromSession(Map<String, Object> sessionAttributes) {
        var validatedSession = validateSessionAttributes(sessionAttributes);
        @SuppressWarnings("unchecked")
        var spaceInfo = (Map<String, Object>) validatedSession.get("spaceInfo");
        if (spaceInfo == null || spaceInfo.isEmpty()) {
            throw new IllegalArgumentException("Invalid session: Missing or empty space information.");
        }
        return spaceInfo;
    }

    /**
     * Retrieves the IDs of spaces associated with the user from the session attributes.
     *
     * @param spaceInfo the session attributes containing user information.
     * @return a list of space IDs associated with the user.
     */
    public List<Long> getSpaceIdsFromSpaceInfo(Map<String, Object> spaceInfo) {
        return spaceInfo.values().stream().filter(v -> v instanceof Long)
                .map(v -> (Long) v)
                .toList();
    }

    /**
     * Validates the user's authorization to access a space based on session attributes and member ID.
     *
     * @param headerAccessor the header accessor containing session attributes.
     * @param memberId the member ID to validate.
     * @return the space ID the member is authorized for.
     * @throws AccessDeniedException if the member does not have access to the space.
     */
    public Long validateSpaceAuth(SimpMessageHeaderAccessor headerAccessor, Long memberId) {
        var spaceInfo = getSpaceInfoFromSession(headerAccessor.getSessionAttributes());
        if (spaceInfo.containsKey(memberId.toString())) {
            return (Long) spaceInfo.get(memberId.toString());
        }
        log.warn("Access denied for member {} to space {}", memberId, spaceInfo);
        throw new AccessDeniedException("Access denied! You don't have permission to access this.");
    }

    /**
     * Subscribes the user to Redis channels associated with their spaces.
     *
     * @param spaceInfo the session attributes containing user and space information.
     */
    public void subscribeToRedisChannels(
            Long userId, Map<String, Object> spaceInfo
    ) {
        var channelIds = getSpaceIdsFromSpaceInfo(spaceInfo);
        if (channelIds == null || channelIds.isEmpty()) return;

        channelIds.forEach(id -> {
            var channel = String.format("/sub/space/%s", id);
            redisService.subscribeToChannel(String.valueOf(userId), channel);
        });
    }

    /**
     * Unsubscribes the user from Redis channels associated with their spaces.
     *
     * @param sessionAttributes the session attributes containing user and space information.
     */
    public void unSubscribeFromRedisChannels(
            Long userId, Map<String, Object> sessionAttributes
    ) {
        var channelIds = getSpaceIdsFromSpaceInfo(sessionAttributes);
        if (channelIds == null || channelIds.isEmpty()) return;

        channelIds.forEach(id -> {
            var channel = String.format("/sub/space/%s", id);
            redisService.unsubscribeFromChannel(String.valueOf(userId), channel);
        });
    }


    /**
     * Publishes the user's offline status to members in their spaces.
     *
     * @param spaceInfo the session attributes containing user and space information.
     * @param status the user's status to be published.
     */
    public void publishOfflineStatusToMembers(
            User user, Map<String, Object> spaceInfo, UserStatus status
    ) {
        var channelIds = getSpaceIdsFromSpaceInfo(spaceInfo);
        if (channelIds == null || channelIds.isEmpty()) return;

        var message = payloadMapper.mapToUserStatusPayload(
                status, user.getUserId(), user.getProfileUrl(), user.getUsername()
        );
        channelIds.forEach(id -> {
            var channel = String.format("/sub/space/%s", id);
            redisService.publishMessage(channel, message);
        });
    }


    public void handleUserSubscription(
            Map<String, Object> spaceInfo, String destination
    ) {
        var spaceIds = getSpaceIdsFromSpaceInfo(spaceInfo);
        List<String> channels = spaceIds.stream()
                .map(id -> String.format("/sub/space/%s", id))
                .toList();
        SpaceChannels payload = payloadMapper.mapToSpaceChannels(channels);

        // Add delay or ensure subscription acknowledgment
        new Thread(() -> {
            try {
                Thread.sleep(1000); // Optional delay
                messagingTemplate.convertAndSend(destination, payload);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }).start();
    }


    public void handleSpaceSubscription(User user, String destination) {
        var message = payloadMapper.mapToUserStatusPayload(
                UserStatus.ONLINE, user.getUserId(), user.getProfileUrl(), user.getUsername()
        );
        redisService.publishMessage(destination, message);
    }

}