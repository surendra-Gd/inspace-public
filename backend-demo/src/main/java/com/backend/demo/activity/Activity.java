package com.backend.demo.activity;

import com.backend.demo.user.User;
import jakarta.persistence.*;
import jdk.jfr.Timestamp;
import lombok.*;

import java.time.LocalDateTime;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
public class Activity {

    @Id
    @GeneratedValue(
            strategy = GenerationType.SEQUENCE,
            generator = "activity-seq"
    )
    @SequenceGenerator(
            name = "activity-seq",
            sequenceName = "activity-seq",
            allocationSize = 1
    )
    private Long id;
    @Column(nullable = false)
    private Long spaceId;
    @ManyToOne
    @JoinColumn(name = "_user", referencedColumnName = "userId")
    private User _user;
    @Enumerated(value = EnumType.STRING)
    private Prompt prompt;
    @Timestamp
    private LocalDateTime timeStamp;
}