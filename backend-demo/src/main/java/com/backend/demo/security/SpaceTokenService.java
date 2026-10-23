package com.backend.demo.security;

import com.backend.demo.exception.AccessDeniedException;
import com.backend.demo.space.SpaceService;
import com.backend.demo.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SpaceTokenService {

    private final JwtService jwtService;
    private final SpaceService spaceService;


    public boolean isValidToken(String token, User authUser) {
        try {
            String username = jwtService.extractUsername(token);
            return username != null && jwtService.isTokenValid(token, authUser);
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return false;
        }
    }


    /**
     * Adds claims for the current space members and generates a token for the authenticated user.
     *
     * @param authUser The authenticated user for whom the token is being generated.
     * @return The generated token.
     */
    public String setClaimsAndGenerateToken(User authUser) {
        Map<String, Object> claims = spaceService.getCurrentSpaceMembers().stream()
                .collect(Collectors.toMap(
                        member -> member.getMemberId().toString(),
                        member -> member.getSpaceId().toString()
                ));

        return jwtService.generateSpaceToken(claims, authUser);
    }


    /**
     * Retrieves the member data from the token based on the member ID.
     *
     * @param token    The JWT token containing the claims.
     * @param memberId The ID of the member to retrieve.
     * @return A map of member data if available, otherwise an empty map.
     * @throws IllegalArgumentException if the member data is not found or the token is invalid.
     */
    public String getSpaceOrThrow(String token, String memberId) {
        Object member = jwtService.getClaim(token, memberId);
        if (member instanceof String) {
            return (String) member;
        } else {
            throw new AccessDeniedException(
                    "Member data not found or token is invalid."
            );
        }
    }

}