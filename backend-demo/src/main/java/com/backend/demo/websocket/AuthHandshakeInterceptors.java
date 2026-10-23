package com.backend.demo.websocket;

import com.backend.demo.jwt_token.TokenRepository;
import com.backend.demo.projections.SpaceTokenProjection;
import com.backend.demo.security.JwtService;
import com.backend.demo.space.SpaceService;
import com.backend.demo.user.User;
import jakarta.servlet.http.HttpServletResponse;
import lombok.NonNull;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AuthHandshakeInterceptors implements HandshakeInterceptor {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;
    private final TokenRepository tokenRepository;
    private final SpaceService spaceService;

    public AuthHandshakeInterceptors(
            JwtService jwtService,
            UserDetailsService userDetailsService,
            TokenRepository tokenRepository,
            @Lazy SpaceService spaceService
    ) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
        this.tokenRepository = tokenRepository;
        this.spaceService = spaceService;
    }

    @Override
    public boolean beforeHandshake(
            @NonNull ServerHttpRequest request,
            @NonNull ServerHttpResponse response,
            @NonNull WebSocketHandler wsHandler,
            @NonNull Map<String, Object> attributes
    ) {
        HttpServletResponse httpResponse = ((ServletServerHttpResponse) response).getServletResponse();


        String header = request.getURI().getQuery();
        if (header == null || !header.startsWith("token=")) {
            httpResponse.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return false;
        }
        String jwt = header.substring(6);
        String username = jwtService.extractUsername(jwt);

        if (username != null) {
            try {
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                if (jwtService.isTokenValid(jwt, userDetails) && tokenRepository.isValidToken(jwt)) {
                    UsernamePasswordAuthenticationToken authUser = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities()
                    );
                    // Retrieve space information (memberId -> spaceId map)
                    Long userId = ((User) userDetails).getUserId();
                    Map<String, Long> spaceInfo = spaceService.getCurrentSpaceMembersByUser(userId).stream()
                            .collect(Collectors.toMap(
                                    member -> member.getMemberId().toString(),
                                    SpaceTokenProjection::getSpaceId
                            ));


                    // Add user and space info to WebSocket session attributes
                    attributes.put("user", authUser);
                    attributes.put("spaceInfo", spaceInfo);
                    return true;
                } else {
                    httpResponse.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                }
            } catch (Exception e) {
                httpResponse.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            }
        } else {
            httpResponse.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        }
        return false;
    }

    @Override
    public void afterHandshake(
            @NonNull ServerHttpRequest request,
            @NonNull ServerHttpResponse response,
            @NonNull WebSocketHandler wsHandler,
            Exception ex
    ) {
        if (ex != null) {
            System.err.println("Handshake failed: " + ex.getMessage());
        } else {
            System.out.println("Handshake successful: " + request.getURI());
        }
    }

}
