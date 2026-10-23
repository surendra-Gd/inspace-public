package com.backend.demo.email.email_token;


import com.backend.demo.user.User;
import lombok.*;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Entity
public class ConfirmationToken {

    @SequenceGenerator(
            name = "confirmation-token-seq",
            sequenceName = "confirmation-token-seq",
            allocationSize = 1
    )
    @Id
    @GeneratedValue(
            strategy = GenerationType.SEQUENCE,
            generator = "confirmation-token-seq"
    )
    private Long id;

    @Column(nullable = false)
    private String token;

    private String sendEmail;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime expiresAt;

    private boolean validated;

    private boolean revoked;

    @ManyToOne
    @JoinColumn(
            nullable = false,
            name = "user_id"
    )
    private User user;

}