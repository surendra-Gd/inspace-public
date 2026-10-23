package com.backend.demo.auth;

import com.backend.demo.user.User;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.http.ResponseEntity;

import java.io.IOException;

public interface AuthenticationService {
    void register(RegisterRequest request);

    ResponseEntity<?> signUpVerification(String token, String email);


    ResponseEntity<?> authenticate(AuthenticationRequest request);

    void saveUserToken(
            User user,
            String accessToken,
            String refreshToken
    );

    void refreshToken(
            HttpServletRequest request,
            HttpServletResponse response
    ) throws IOException;

    ResponseEntity<?> checkEmailAvailability(String email);

    ResponseEntity<?> forgetPasswordEmail(String email);

    ResponseEntity<?> resetPassword(ForgetPasswordRequest request);

    ResponseEntity<?> forgetPasswordVerification(String token, String email);

    @Modifying
    @Transactional
    ResponseEntity<?> updateUsername(String username);
}
