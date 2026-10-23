package com.backend.demo.jwt_token;


import com.backend.demo.user.User;
import jakarta.persistence.*;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class Token {

    @Id
    @SequenceGenerator(
            name = "token-seq",
            sequenceName = "token-seq",
            allocationSize = 1
    )
    @GeneratedValue(
            strategy = GenerationType.SEQUENCE,
            generator = "token-seq"
    )
    private Long id;

    private String accessToken;
    private String refreshToken;

    @Enumerated(EnumType.STRING)
    private TokenType tokenType;

    private boolean expired;

    private boolean revoked;

    @ManyToOne
    @JoinColumn(name = "_user")
    private User user;

}
