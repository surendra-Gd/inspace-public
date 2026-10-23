package com.backend.demo.websocket;

import com.backend.demo.exception.*;
import com.backend.demo.payload.Action;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageExceptionHandler;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.ControllerAdvice;

@ControllerAdvice
@RequiredArgsConstructor
public class WebSocketExceptionHandler {

    private final SimpMessagingTemplate messagingTemplate;
    private final WebSocketService webSocketService;

    @MessageExceptionHandler(Exception.class)
    public void handleGenericException(Exception ex, SimpMessageHeaderAccessor headerAccessor) {
        handleException(ex, headerAccessor, "Oops! Something went wrong. Try again!");
    }

    @MessageExceptionHandler(OperationFailedException.class)
    public void handleOperationFailedException(OperationFailedException ex, SimpMessageHeaderAccessor headerAccessor) {
        handleException(ex, headerAccessor, ex.getMessage());
    }

    @MessageExceptionHandler(DatabaseOperationException.class)
    public void handleDatabaseOperationException(DatabaseOperationException ex, SimpMessageHeaderAccessor headerAccessor) {
        System.out.println(ex.getOperationDetail());
        handleException(ex, headerAccessor, ex.getMessage());
    }

    @MessageExceptionHandler(ResourceFoundException.class)
    public void handleResourceFoundException(ResourceFoundException ex, SimpMessageHeaderAccessor headerAccessor) {
        handleException(ex, headerAccessor, ex.getMessage());
    }

    @MessageExceptionHandler(ResourceNotFoundException.class)
    public void handleResourceNotFoundException(ResourceNotFoundException ex, SimpMessageHeaderAccessor headerAccessor) {
        handleException(ex, headerAccessor, ex.getMessage());
    }

    @MessageExceptionHandler(InvalidCredentialsException.class)
    public void handleInvalidCredentialsException(InvalidCredentialsException ex, SimpMessageHeaderAccessor headerAccessor) {
        handleException(ex, headerAccessor, ex.getMessage());
    }

    private void handleException(Exception ex, SimpMessageHeaderAccessor headerAccessor, String message) {
        var user = webSocketService.getUserFromSession(headerAccessor.getSessionAttributes());
        ErrorResponse response = ErrorResponse.builder()
                .action(Action.WS_APPLICATION_ERROR)
                .code(5000)
                .message(message)
                .build();
        System.out.println(ex.getMessage());

        messagingTemplate.convertAndSend(
                String.format("/sub/user/%s", user.getUserId()), response
        );
    }
}