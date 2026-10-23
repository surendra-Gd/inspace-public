package com.backend.demo.notification;

import com.backend.demo.space.SpaceRepository;
import com.backend.demo.user.User;
import com.backend.demo.user.UserService;
import com.google.firebase.messaging.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.List;


@Service
@RequiredArgsConstructor
public class NotificationService {

    private final UserService userService;
    private final NotificationTokenRepository tokenRepository;
    private final SpaceRepository spaceRepository;

    @Transactional
    public ResponseEntity<?> storeNotificationToken(String deviceToken) {
        Long userId = userService.currentUser().getUserId();
        tokenRepository.findByUserId(userId)
                .ifPresentOrElse(
                        existingToken -> updateExistingToken(existingToken, deviceToken),
                        () -> saveNewToken(userId, deviceToken)
                );

        return ResponseEntity.ok("Notification token processed successfully.");
    }

    private void updateExistingToken(NotificationToken existingToken, String deviceToken) {
        existingToken.setDeviceToken(deviceToken);
        existingToken.setLastUpdatedAt(LocalDateTime.now());
        existingToken.setExpired(false);

        tokenRepository.save(existingToken);
    }

    private void saveNewToken(Long userId, String deviceToken) {
        NotificationToken newToken = NotificationToken.builder()
                .deviceToken(deviceToken)
                .userId(userId)
                .isExpired(false)
                .createdAt(LocalDateTime.now())
                .lastUpdatedAt(LocalDateTime.now())
                .build();

        tokenRepository.save(newToken);
    }

    private void sendPushNotification(
            String fcmToken, String title, String body,
            Map<String, String> payload, String imageUrl
    ) {
        Message message = Message.builder()
                .setToken(fcmToken)
                .setNotification(Notification.builder()
                        .setTitle(title)
                        .setBody(body)
                        .setImage(imageUrl.isEmpty() ? null : imageUrl)
                        .build())
                .putAllData(payload)
                .build();

        try {
            String response = FirebaseMessaging.getInstance().send(message);
            System.out.println("Successfully sent message: " + response);
        } catch (FirebaseMessagingException e) {
            tokenRepository.flagTokensAsExpired(fcmToken, LocalDateTime.now());
            System.out.println(e.getMessage());
        }
    }

    private Map<String, String> createPayload(
            NotificationType type, String uniqueId, Long... ids
    ) {
        Map<String, String> payload = new HashMap<>();
        payload.put("action", String.valueOf(type));
        payload.put("uniqueId", uniqueId);

        if (ids != null && ids.length > 0) {
            payload.put("memberId", String.valueOf(ids[0]));
        }
        if (ids != null && ids.length > 1) {
            payload.put("targetFeatureId", String.valueOf(ids[1]));
        }

        return payload;
    }

    public void notificationOnNewPost(
            Long spaceId, Long postId, Long memberId, int streak
    ) {
        var user = userService.currentUser();

        String uniqueId = spaceRepository.getUniqueIdBySpaceId(spaceId);
        List<String> deviceTokens = tokenRepository.getMemberDeviceTokens(
                spaceId, user.getUserId()
        );

        NotificationType type = NotificationType.POST_ADDED;
        var title = type.getTitle();
        var content = type.formatPostContent(streak, user.getUsername(), uniqueId, "post");
        var imageUrl = user.getProfileUrl();

        Map<String, String> payload = createPayload(
                type, uniqueId, memberId, postId
        );

        deviceTokens.forEach(t -> {
            sendPushNotification(t, title, content, payload, imageUrl);
        });
    }

    public void notificationOnNewMemberJoin(
            Long spaceId, String username, String imageUrl,
            Long userId, Long memberId
    ) {
        String uniqueId = spaceRepository.getUniqueIdBySpaceId(spaceId);
        List<String> deviceTokens = tokenRepository.getMemberDeviceTokens(spaceId, userId);

        NotificationType type = NotificationType.JOIN_MEMBER;
        var title = type.getTitle();
        var content = type.format(username, uniqueId);

        Map<String, String> payload = createPayload(type, uniqueId, memberId);

        deviceTokens.forEach(t -> {
            sendPushNotification(t, title, content, payload, imageUrl);
        });
    }

    public void notificationOnNewText(
            Long spaceId, Long textId, Long memberId, User user, int streak
    ) {

        String uniqueId = spaceRepository.getUniqueIdBySpaceId(spaceId);
        List<String> deviceTokens = tokenRepository.getMemberDeviceTokens(
                spaceId, user.getUserId()
        );

        NotificationType type = NotificationType.TEXT_ADDED;
        var title = type.getTitle();
        var content = type.formatPostContent(streak, user.getUsername(), uniqueId, "text");
        var imageUrl = user.getProfileUrl();

        Map<String, String> payload = createPayload(
                type, uniqueId, memberId, textId
        );

        deviceTokens.forEach(t -> {
            sendPushNotification(t, title, content, payload, imageUrl);
        });
    }

    public void notificationOnFriendRequests(
            User user, Long targetUserId, NotificationType type
    ) {
        var content = type.format(user.getUsername());
        var imageUrl = user.getProfileUrl();

        String deviceToken = tokenRepository.getDeviceTokenByUserId(targetUserId)
                .orElse(null);
        if (deviceToken == null) return;

        Map<String, String> payload = new HashMap<>();
        payload.put("action", String.valueOf(type));

        sendPushNotification(
                deviceToken, type.getTitle(), content, payload, imageUrl
        );
    }

    public void notificationOnSpaceRequest(
            Long targetUserId, String uniqueId,
            NotificationType type, String imageUrl
    ) {
        var content = type.format(uniqueId);
        String deviceToken = tokenRepository.getDeviceTokenByUserId(targetUserId)
                .orElse(null);
        if (deviceToken == null) return;
        Map<String, String> payload = new HashMap<>();
        payload.put("action", String.valueOf(type));
        sendPushNotification(
                deviceToken, type.getTitle(), content, payload, imageUrl
        );
    }

    @Modifying
    @Transactional
    public void flagTokenAsExpired(Long userId) {
        tokenRepository.findByUserId(userId).ifPresent(token -> {
            if (!token.isExpired()) {
                token.setExpired(true);
                token.setLastUpdatedAt(LocalDateTime.now());
                tokenRepository.save(token);
            }
        });
    }

}