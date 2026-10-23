package com.backend.demo.spacerequest;


import com.backend.demo.user.User;
import com.backend.demo.space.Space;
import jakarta.persistence.*;
import jdk.jfr.Timestamp;
import lombok.*;

import java.time.LocalDateTime;


@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity
public class SpaceRequest {

    @Id
    @SequenceGenerator(
            name = "space-request-seq",
            sequenceName = "space-request-seq",
            allocationSize = 1
    )
    @GeneratedValue(
            strategy = GenerationType.SEQUENCE,
            generator = "space-request-seq"
    )
    private Long requestId;
    @ManyToOne
    @JoinColumn(
            name = "space",
            referencedColumnName = "spaceId",
            nullable = false
    )
    private Space space;

    @ManyToOne
    @JoinColumn(
            name = "request_by",
            referencedColumnName = "userId",
            nullable = false
    )
    private User requestedBy;

    @Timestamp
    private LocalDateTime requestedOn;
    @Enumerated(value = EnumType.STRING)
    private Status status;
    private boolean adminSeen;
}
