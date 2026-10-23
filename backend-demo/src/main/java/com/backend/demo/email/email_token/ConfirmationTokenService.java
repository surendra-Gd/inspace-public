package com.backend.demo.email.email_token;


import com.backend.demo.exception.DatabaseOperationException;
import com.backend.demo.user.User;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
@AllArgsConstructor
public class ConfirmationTokenService {

    private final ConfirmationTokenRepository tokenRepository;

    public Optional<ConfirmationToken> getToken(String token) {
        try {
            return tokenRepository.findByToken(token);
        } catch (Exception e) {
            throw new DatabaseOperationException(e.getMessage(),
                    "There is an error occurred on getToken in ConfirmationTokenService by get " +
                            "-P %s".formatted(token)
            );
        }
    }

    @Transactional
    public void setConfirmedAt(String token) {
        try {
            tokenRepository.updateValidatedAt(token);
        } catch (Exception e) {
            throw new DatabaseOperationException(e.getMessage(),
                    "There is an error occurred on setConfirmedAt in ConfirmationTokenService in update " +
                            "-P %s".formatted(token)
            );
        }
    }



    public String generateAndSaveToken(User user, String email) {
        String generatedToken = generateActivationCode(7);
        revokeAllEmailTokens(user);
        var token = ConfirmationToken.builder()
                .token(generatedToken)
                .createdAt(LocalDateTime.now())
                .sendEmail(email)
                .expiresAt(LocalDateTime.now().plusMinutes(30))
                .user(user)
                .build();
        try {
            tokenRepository.save(token);
            return generatedToken;
        } catch (Exception e) {
            throw new DatabaseOperationException(e.getMessage(),
                    "There is an error occurred on generateAndSaveToken in ConfirmationTokenService in save " +
                            "-P %s".formatted(token.toString())
            );
        }
    }

    private void revokeAllEmailTokens(User user) {
        var savedTokens = tokenRepository
                .findAllValidateTokensByUser(user.getUserId());

        if(savedTokens.isEmpty()) return;
        savedTokens.forEach(t -> t.setRevoked(true));
        tokenRepository.saveAll(savedTokens);
    }

    private String generateActivationCode(int len) {
        String characters = "0123456789";
        StringBuilder codeBuilder = new StringBuilder();
        SecureRandom secureRandom = new SecureRandom();
        for (int i = 0; i < len; i++) {
            int randomIndex = secureRandom.nextInt(characters.length());
            codeBuilder.append(characters.charAt(randomIndex));
        }
        return codeBuilder.toString();
    }
}