package com.backend.demo.websocket;

import lombok.NonNull;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
@Slf4j
public class SubscriptionInterceptor implements ChannelInterceptor {

    private final WebSocketService websocketService;

    public SubscriptionInterceptor(@Lazy WebSocketService websocketService) {
        this.websocketService = websocketService;
    }


    @Override
    public Message<?> preSend(
            @NonNull Message<?> message, @NonNull MessageChannel channel
    ) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);
        if (StompCommand.SUBSCRIBE.equals(accessor.getCommand())) {
            String destination = accessor.getDestination();
            Map<String, Object> sessionAttributes = accessor.getSessionAttributes();

            if (!isValidSubscription(sessionAttributes, destination)) {
                log.warn("Invalid subscription attempt: destination={}, sessionAttributes={}", destination, sessionAttributes);
                return null;
            }
        }
        System.out.println("Going:  " + accessor.getCommand());
        return message;
    }

    private boolean isValidSubscription(
            Map<String, Object> sessionAttributes, String destination
    ) {
        if (sessionAttributes == null || sessionAttributes.isEmpty()) {
            return false;
        }
        if (destination.startsWith("/sub/user")) {
            return validateUserSubscription(sessionAttributes, destination);
        } else if (destination.startsWith("/sub/space")) {
            return validateSpaceSubscription(sessionAttributes, destination);
        }
        return false;
    }

    private boolean validateUserSubscription(
            Map<String, Object> sessionAttributes, String destination
    ) {
        var user = websocketService.getUserFromSession(sessionAttributes);
        if (user == null) {
            return false;
        }

        String destinationUserId = destination.substring("/sub/user/".length());
        Long sessionUserId = user.getUserId();
        return String.valueOf(sessionUserId).equals(destinationUserId);
    }

    private boolean validateSpaceSubscription(
            Map<String, Object> sessionAttributes, String destination
    ) {
        try {
            Long spaceId = Long.valueOf(destination.substring("/sub/space/".length()));
            var spaceInfo = websocketService.getSpaceInfoFromSession(sessionAttributes);
            return spaceInfo.containsValue(spaceId);
        } catch (NumberFormatException ex) {
            return false;
        }
    }
}
