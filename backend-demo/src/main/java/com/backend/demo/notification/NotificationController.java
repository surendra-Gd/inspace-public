package com.backend.demo.notification;


import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/v1/notification")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @PostMapping("/save-token")
    public ResponseEntity<?> storeNotificationToken(
            @RequestBody TokenRequest tokenRequest
    ) {
        String deviceToken = tokenRequest.getToken();
        return notificationService.storeNotificationToken(deviceToken);
    }
}
