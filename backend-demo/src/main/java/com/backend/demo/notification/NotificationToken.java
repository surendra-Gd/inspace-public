package com.backend.demo.notification;

import jakarta.persistence.*;
import jdk.jfr.Timestamp;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity
public class NotificationToken {

    @Id
    @SequenceGenerator(
            name = "notification_token-seq",
            sequenceName = "notification_token-seq",
            allocationSize = 1
    )
    @GeneratedValue(
            strategy = GenerationType.SEQUENCE,
            generator = "notification_token-seq"
    )
    private Long tokenId;
    @Column(length = 512, nullable = false)
    private String deviceToken;
    private Long userId;
    private boolean isExpired;
    @Timestamp
    private LocalDateTime createdAt;
    @Timestamp
    private LocalDateTime lastUpdatedAt;
}