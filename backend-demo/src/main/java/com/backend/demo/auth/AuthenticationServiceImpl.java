package com.backend.demo.auth;

import com.backend.demo.common.ApiResponse;
import com.backend.demo.dto.DTOMapper;
import com.backend.demo.dto.ResponseObject;
import com.backend.demo.email.EmailSender;
import com.backend.demo.email.EmailTemplateName;
import com.backend.demo.email.email_token.ConfirmationToken;
import com.backend.demo.email.email_token.ConfirmationTokenService;
import com.backend.demo.exception.DatabaseOperationException;
import com.backend.demo.exception.ResourceFoundException;
import com.backend.demo.exception.InvalidCredentialsException;
import com.backend.demo.exception.ResourceNotFoundException;
import com.backend.demo.jwt_token.Token;
import com.backend.demo.jwt_token.TokenRepository;
import com.backend.demo.jwt_token.TokenType;
import com.backend.demo.redis.UserCacheService;
import com.backend.demo.security.JwtService;
import com.backend.demo.user.User;
import com.backend.demo.user.UserRepository;
import com.backend.demo.user.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

import static com.backend.demo.email.EmailTemplateName.ACTIVATE_ACCOUNT;
import static com.backend.demo.email.EmailTemplateName.RESET_PASSWORD;


@Service
@RequiredArgsConstructor
public class AuthenticationServiceImpl implements AuthenticationService {

    private final UserRepository repository;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final TokenRepository tokenRepository;
    private final UserService userService;
    private final EmailSender emailSender;
    private final ConfirmationTokenService tokenService;
    private final UserRepository userRepository;
    private final DTOMapper mapper;
    private final UserCacheService cacheService;


    @Override
    public void register(RegisterRequest request) {
        boolean emailExists = repository.existsByEmail(request.getEmail());
        if(emailExists) {
            throw new ResourceFoundException("This email is already registered. Please use a different email.");
        }
        boolean usernameExists = userRepository.existsByUsername(request.getUsername());
        if(usernameExists) {
            throw new ResourceFoundException("The username '" + request.getUsername() + "' is not available. Please try a different username or consider using a variation.");
        }
        var user = userService.signUpUser(request);
        sendEmailAndSave(user, ACTIVATE_ACCOUNT);
    }



    private void sendEmailAndSave(
            User user, EmailTemplateName emailTemplateName
    ) {
        var newToken = tokenService.generateAndSaveToken(user, user.getEmail());

        var to = user.getEmail();
        var templateName = emailTemplateName.getName();
        var subject = emailTemplateName.getSubject();

        Map<String, String> variables = new HashMap<>();
        variables.put("username", user.getUsername());
        variables.put("activation_code", newToken);

        emailSender.sendEmail(to, subject, templateName, variables);
    }


    @Override
    public ResponseEntity<?> signUpVerification(String token, String email) {
        ConfirmationToken savedToken = tokenService.getToken(token).orElse(null);
        if(savedToken == null || !Objects.equals(savedToken.getUser().getEmail(), email)) {
            throw new InvalidCredentialsException("The credentials provided do not match our records. Please verify your information and try again.");
        }
        if (savedToken.isValidated()) {
            throw new ResourceFoundException("Email is already verified");
        }
        if(LocalDateTime.now().isAfter(savedToken.getExpiresAt()) || savedToken.isRevoked()) {
            throw new InvalidCredentialsException("The verification code has expired. Please try again later.");
        }
        tokenService.setConfirmedAt(token);
        userService.enableUser(savedToken.getUser().getEmail());
        cacheService.evictUserCache(savedToken.getUser().getUsername());
        var user = savedToken.getUser();
        var accessToken = jwtService.generateAuthToken(user);
        var refreshToken = jwtService.generateRefreshToken(user);
        saveUserToken(user, accessToken, refreshToken);
        AuthenticationResponse response = AuthenticationResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .user(mapper.mapToCurrentUser(user))
                .build();
        return ResponseEntity.ok(response);
    }


    @Override
    public ResponseEntity<?> authenticate(AuthenticationRequest request) {
        cacheService.evictUserCache(request.getUsername());
        var auth = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getUsername(),
                            request.getPassword()
                    )
        );
        var authUser = (User) auth.getPrincipal();
        var accessToken = jwtService.generateAuthToken(authUser);
        var refreshToken = jwtService.generateRefreshToken(authUser);
        revokeAllUserTokens(authUser);
        saveUserToken(authUser, accessToken, refreshToken);
        AuthenticationResponse response = AuthenticationResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .user(mapper.mapToCurrentUser(authUser))
                .build();
        return ResponseEntity.ok(response);
    }


    private void revokeAllUserTokens(User user) {
        var validUserTokens = tokenRepository
                .findAllValidTokensByUser(user.getUserId());
        if(validUserTokens.isEmpty()) return;
        validUserTokens.forEach(t -> {
            t.setExpired(true);
            t.setRevoked(true);
        });
        tokenRepository.saveAll(validUserTokens);
    }

    @Override
    public void saveUserToken(
            User user,
            String accessToken,
            String  refreshToken
    ) {
        var token = Token.builder()
                .user(user)
                .accessToken(accessToken)
                .tokenType(TokenType.BEARER)
                .refreshToken(refreshToken)
                .expired(false)
                .revoked(false)
                .build();
        tokenRepository.save(token);
    }


    @Override
    public void refreshToken(
            HttpServletRequest request,
            HttpServletResponse response
    ) throws IOException {
        final String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
        final String username;
        final String token;
        if(authHeader == null || !authHeader.startsWith("Bearer ")) {
            return;
        }
        token = authHeader.substring(7);
        username = jwtService.extractUsername(token);
        if(username != null) {
            var user = this.repository.findNonExpiredUserByUsername(username)
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Invalid token. %s not found".formatted(username)
                    ));
            if(jwtService.isTokenValid(token, user)) {
                var accessToken = jwtService.generateAuthToken(user);
                revokeAllUserTokens(user);
                saveUserToken(user, accessToken, token);
                AuthenticationResponse authorizeResponse = AuthenticationResponse.builder()
                        .accessToken(accessToken)
                        .refreshToken(token)
                        .user(mapper.mapToCurrentUser(user))
                        .build();
                new ObjectMapper().writeValue(response.getOutputStream(), authorizeResponse);
            }
        }
    }

    @Override
    public ResponseEntity<?> checkEmailAvailability(String email) {
        boolean isEmailExists = repository.existsByEmail(email);
        if(isEmailExists) {
            throw new ResourceFoundException("This email is already registered. Please use a different email.");
        }
        return ResponseEntity.status(200).build();
    }


    @Override
    @Transactional
    public ResponseEntity<?> forgetPasswordEmail(String email) {
        User user = userService.getUserByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "We couldn't find an account associated with this email."
                ));
        if(!user.isEnabled()) {
            sendEmailAndSave(user, ACTIVATE_ACCOUNT);
            var response = createResponse(
                    202,
                    "Account Activation",
                    "Your email is not verified. We have sent an activation code to your email."
            );
            return ResponseEntity.accepted().body(response);
        }
        sendEmailAndSave(user, RESET_PASSWORD);
        var response = createResponse(
                200,
                "Reset Password",
                "We have sent a verification code to your email to reset your password."
        );
        return ResponseEntity.ok().body(response);
    }

    private ResponseObject createResponse(
            int status, String code, String message
    ) {
        return ResponseObject.builder()
                .status(status)
                .code(code)
                .message(message)
                .build();
    }


    @Override
    public ResponseEntity<?> resetPassword(ForgetPasswordRequest request) {
        ConfirmationToken savedToken = tokenService.getToken(request.getCode())
                .orElse(null);
        if(savedToken == null || !Objects.equals(savedToken.getUser().getEmail(), request.getEmail())) {
            throw new InvalidCredentialsException("The provided code is invalid. Please check the verification code in your email.");
        } else if (isTokenExpired(savedToken)) {
            throw new InvalidCredentialsException("The code has expired. Please request a new password reset code.");
        }

        if(!request.getPassword().equals(request.getConfirmPassword())) {
            throw new InvalidCredentialsException(
                    "The passwords you entered do not match. Please try again."
            );
        }
        var user = savedToken.getUser();
        try {
            userService.updatePassword(user.getUserId(), request.getPassword());
            tokenService.setConfirmedAt(request.getCode());
            cacheService.evictUserCache(user.getUsername());
            return ResponseEntity.ok("Your password has been reset successfully. You can now log in with your new password.");
        } catch (Exception e) {
            throw new DatabaseOperationException(e.getMessage(),
                    "There is an error occurred on resetPassword in AuthService by save " +
                            "-P %s".formatted(user.toString())
            );
        }
    }


    @Override
    public ResponseEntity<?> forgetPasswordVerification(String token, String email) {
        ConfirmationToken savedToken = tokenService.getToken(token)
                .orElse(null);
        if(savedToken == null || !Objects.equals(savedToken.getUser().getEmail(), email)) {
            throw new InvalidCredentialsException("The provided code is invalid. Please check the verification code in your email.");
        } else if (isTokenExpired(savedToken)) {
            throw new InvalidCredentialsException("The code has expired. Please request a new password reset code.");
        }
        var username = savedToken.getUser().getUsername();
        var response = ApiResponse.builder()
                .status(200)
                .message("code is validated successfully. Please reset your password.")
                .payload(username)
                .build();
        return ResponseEntity.ok(response);
    }


    private boolean isTokenExpired(ConfirmationToken token) {
        return (token.isValidated() || token.isRevoked()
                || LocalDateTime.now().isAfter(token.getExpiresAt()));
    }

    @Modifying
    @Transactional
    @Override
    public ResponseEntity<?> updateUsername(String username) {
        var user = userService.currentUser();
        if(user.getUsername().equals(username)) {
            return ResponseEntity.ok(username);
        }
        var usernameExists = userRepository.existsByUsername(username);
        if(usernameExists) {
            throw new ResourceFoundException("Username not available");
        }
        user.setUsername(username);
        var authUser = userRepository.save(user);
        cacheService.evictUserCache(authUser.getUsername());
        var accessToken = jwtService.generateAuthToken(authUser);
        var refreshToken = jwtService.generateRefreshToken(authUser);
        saveUserToken(authUser, accessToken, refreshToken);
        AuthenticationResponse response = AuthenticationResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .user(mapper.mapToCurrentUser(authUser))
                .build();
        return ResponseEntity.ok(response);
    }

}