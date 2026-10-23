package com.backend.demo.friendrequest;

import com.backend.demo.spacerequest.Status;
import com.backend.demo.user.User;
import jakarta.persistence.*;
import jdk.jfr.Timestamp;
import lombok.*;

import java.time.LocalDateTime;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class FriendRequest {

    @Id
    @SequenceGenerator(
            name="friend-request-seq",
            sequenceName = "friend-request-seq",
            allocationSize = 1
    )
    @GeneratedValue(
            strategy = GenerationType.SEQUENCE,
            generator = "friend-request-seq"
    )
    private Long requestId;
    @ManyToOne
    @JoinColumn(
            name = "requester",
            referencedColumnName = "userId",
            nullable = false
    )
    private User requester;
    @ManyToOne
    @JoinColumn(
            name = "request_to",
            referencedColumnName = "userId",
            nullable = false
    )
    private User requestTo;

    @Timestamp
    private LocalDateTime requestOn;
    @Enumerated(value = EnumType.STRING)
    private Status status;
    private boolean targetUserSeen;
}
