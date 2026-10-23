package com.backend.demo.security;

import com.backend.demo.exception.InvalidCredentialsException;
import com.backend.demo.user.User;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerExecutionChain;
import org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.file.AccessDeniedException;

/**
 * A filter that handles authentication and authorization for requests requiring space-specific security.
 * This filter checks for the presence of a valid security token and verifies if the authenticated user has
 * access to the requested space.
 *
 * The filter operates only on requests that are mapped to methods annotated with {@link SpaceSecured}.
 *
 * It extends {@link OncePerRequestFilter} to ensure it is executed once per request.
 */
@Component
@RequiredArgsConstructor
public class SpaceAuthenticationFilter extends OncePerRequestFilter {

    private final SpaceTokenService tokenService;
    private final RequestMappingHandlerMapping handlerMapping;

    /**
     * Performs the filtering logic for each request.
     *
     * @param request The HTTP request to be filtered.
     * @param response The HTTP response to be sent to the client.
     * @param filterChain The chain of filters to which the request should be passed.
     * @throws ServletException If a servlet-specific error occurs during the filtering.
     * @throws IOException If an I/O error occurs during the filtering.
     */
    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        if (request.getServletPath().contains("/api/v1/auth") ||  request.getServletPath().contains("/ws/websocket")) {
            filterChain.doFilter(request, response);
            return;
        }

        HandlerExecutionChain handlerExecutionChain = null;
        try {
            handlerExecutionChain = handlerMapping.getHandler(request);
        } catch (ServletException e) {
            throw new RuntimeException("Servlet exception occurred, please try again later %s, error: %s".formatted(request.getRequestURI(), e));
        } catch (Exception e) {
            throw new RuntimeException("Something went wrong, please try again later: %s, error: %s".formatted(request.getRequestURI(), e));
        }

        if (handlerExecutionChain == null) {
            filterChain.doFilter(request, response);
            return;
        }

        Object handler = handlerExecutionChain.getHandler();
        if (handler instanceof HandlerMethod handlerMethod) {
            if (handlerMethod.hasMethodAnnotation(SpaceSecured.class)) {
                String token = request.getHeader("X-Space-Token");
                String memberIdHeader = request.getHeader("X-Member-Id");
                String spaceIdHeader = request.getHeader("X-Space-Id");

                if ((memberIdHeader == null || memberIdHeader.isEmpty()) ||
                        (spaceIdHeader == null || spaceIdHeader.isEmpty())) {
                    throw new InvalidCredentialsException("Headers are not valid");
                }

                var auth = SecurityContextHolder.getContext().getAuthentication();
                if (auth != null && auth.getPrincipal() instanceof User authUser) {
                    if (token == null || !tokenService.isValidToken(token, authUser)) {
                        token = tokenService.setClaimsAndGenerateToken(authUser);
                        response.setHeader("X-Space-Token", token);
                    }
                    String tokenSpaceId = tokenService.getSpaceOrThrow(token, memberIdHeader);

                    if (tokenSpaceId == null || !tokenSpaceId.equals(spaceIdHeader)) {
                        throw new AccessDeniedException("Access Denied to this resource");
                    } else {
                        request.setAttribute("spaceId", tokenSpaceId);
                        request.setAttribute("memberId", memberIdHeader);
                    }
                }
            }
        }

        filterChain.doFilter(request, response);
    }
}