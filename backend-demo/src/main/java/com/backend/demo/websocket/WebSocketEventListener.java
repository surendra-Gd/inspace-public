package com.backend.demo.websocket;


import com.backend.demo.redis.OnlineUserService;
import com.backend.demo.exception.SubscriptionException;
import com.backend.demo.payload.UserStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;
import org.springframework.web.socket.messaging.SessionSubscribeEvent;

import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class WebSocketEventListener {

    private final WebSocketService webSocketService;
    private final OnlineUserService onlineUserService;


    @EventListener
    public void handleWebSocketConnected(SessionConnectEvent event) {
        SimpMessageHeaderAccessor headerAccessor = SimpMessageHeaderAccessor.wrap(event.getMessage());
        Map<String, Object> sessionAttributes = headerAccessor.getSessionAttributes();
        if (sessionAttributes == null) {
            log.error("Session attributes are null during WebSocket connection event");
            return;
        }

        var userId = webSocketService.getUserFromSession(sessionAttributes).getUserId();
        var spaceInfo = webSocketService.getSpaceInfoFromSession(sessionAttributes);

        try {
            webSocketService.subscribeToRedisChannels(userId, spaceInfo);
            onlineUserService.markUserOnline(userId);
        } catch (Exception e) {
            log.error("Error handling WebSocket connection event", e);
        }
    }


    @EventListener
    public void handleWebSocketDisConnected(SessionDisconnectEvent event) {
        SimpMessageHeaderAccessor headerAccessor = SimpMessageHeaderAccessor.wrap(event.getMessage());
        Map<String, Object> sessionAttributes = headerAccessor.getSessionAttributes();
        if (sessionAttributes == null) {
            log.error("Session attributes are null during WebSocket disconnection event");
            return;
        }
        var user = webSocketService.getUserFromSession(sessionAttributes);
        var spaceInfo = webSocketService.getSpaceInfoFromSession(sessionAttributes);

        Long userId = user.getUserId();

        try {
            webSocketService.publishOfflineStatusToMembers(
                    user, spaceInfo, UserStatus.OFFLINE
            );
            webSocketService.unSubscribeFromRedisChannels(userId, spaceInfo);
            onlineUserService.markUserOffline(userId);
        } catch (Exception e) {
            log.error("Error handling WebSocket disconnection event", e);
        }
    }


    // Todo: Logging added later.
    @EventListener
    public void handleSubscriptionEvent(SessionSubscribeEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        String destination = accessor.getDestination();
        Map<String, Object> sessionAttributes = accessor.getSessionAttributes();
        if (sessionAttributes == null) {
//            log.error("Session attributes are null during WebSocket disconnection event");
            return;
        }
        var user = webSocketService.getUserFromSession(sessionAttributes);
        var spaceInfo = webSocketService.getSpaceInfoFromSession(sessionAttributes);

        if (destination == null || destination.isBlank()) {
            throw new SubscriptionException("Invalid subscription destination.");
        }
        if (destination.startsWith("/sub/user")) {
            webSocketService.handleUserSubscription(spaceInfo, destination);
        } else if (destination.startsWith("/sub/space")) {
            webSocketService.handleSpaceSubscription(user, destination);
        } else {
            throw new SubscriptionException(
                    "Invalid subscription destination: " + destination
            );
        }
    }

}