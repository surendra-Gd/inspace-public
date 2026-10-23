package com.backend.demo.security;

import com.backend.demo.exception.ResourceNotFoundException;
import com.backend.demo.jwt_token.TokenRepository;
import com.backend.demo.notification.NotificationService;
import com.backend.demo.redis.UserCacheService;
import com.backend.demo.user.User;
import com.backend.demo.user.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.logout.LogoutHandler;
import org.springframework.stereotype.Service;


@Service
@RequiredArgsConstructor
public class LogoutService implements LogoutHandler {

    private final TokenRepository tokenRepository;
    private final UserCacheService cacheService;
    private final NotificationService notificationService;
    private final JwtService jwtService;
    private final UserRepository repository;


    @Override
    public void logout(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) {
        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        if (authHeader == null ||!authHeader.startsWith("Bearer ")) {
            return;
        }
        jwt = authHeader.substring(7);
        var username = jwtService.extractUsername(jwt);
        var storedToken = tokenRepository.findByAccessToken(jwt)
                .orElse(null);
        if(username != null) {
            var user = this.repository.findNonExpiredUserByUsername(username)
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Invalid token. %s not found".formatted(username)
                    ));
            cacheService.evictUserCache(username);
            notificationService.flagTokenAsExpired(user.getUserId());
        }
        if (storedToken != null) {
            storedToken.setExpired(true);
            storedToken.setRevoked(true);
            tokenRepository.save(storedToken);
            SecurityContextHolder.clearContext();
        }
    }
}