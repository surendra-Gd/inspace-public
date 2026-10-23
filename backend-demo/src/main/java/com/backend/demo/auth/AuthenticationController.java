package com.backend.demo.auth;

import com.backend.demo.apirequest.AuthVerificationRequest;
import com.backend.demo.exception.InvalidCredentialsException;
import com.backend.demo.security.ValidationService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
@RequestMapping("api/v1/auth")
@RequiredArgsConstructor
public class AuthenticationController {


    private final AuthenticationService authService;
    private final ValidationService validationService;


    @PostMapping(value = "/register")
    public ResponseEntity<?> register(
            @Valid @RequestBody RegisterRequest request
    ) {
        authService.register(request);
        return ResponseEntity.ok().build();
    }


    @PostMapping("/signup-verification")
    public ResponseEntity<?> signUpVerification(
            @Valid @RequestBody AuthVerificationRequest request
    ) {
        var token = request.getToken();
        var email = request.getEmail();
        return authService.signUpVerification(token, email);
    }


    @GetMapping("/check-email-availability")
    public ResponseEntity<?> checkEmailAvailability(
            @RequestParam("email") String email
    ) {
        boolean isEmailValid = validationService.isValidEmail(email);
        if(!isEmailValid) {
            throw new InvalidCredentialsException("Please give valid email");
        }
        return authService.checkEmailAvailability(email);
    }


    @PostMapping("/authenticate")
    public ResponseEntity<?> authenticate(
            @Valid @RequestBody AuthenticationRequest request
    ) {
        return authService.authenticate(request);
    }


    @PostMapping("/refresh-token")
    public void refreshToken(
            HttpServletRequest request,
            HttpServletResponse response
    ) throws IOException {
        authService.refreshToken(request, response);
    }


    @PostMapping("/forget-password-email")
    public ResponseEntity<?> forgetPasswordEmail(
            @RequestParam("email") String email
    ) {
        boolean isEmailValid = validationService.isValidEmail(email);
        if(!isEmailValid) {
            throw new InvalidCredentialsException("Error: Please give valid email.");
        }
        return authService.forgetPasswordEmail(email);
    }

    @PostMapping("/forget-password-verification")
    public ResponseEntity<?> forgetPasswordVerification(
            @Valid @RequestBody AuthVerificationRequest request
    ) {
        var token = request.getToken();
        var email = request.getEmail();
        return authService.forgetPasswordVerification(token, email);
    }


    @PostMapping("reset-password")
    public ResponseEntity<?> resetPassword(
            @Valid @RequestBody ForgetPasswordRequest request
    ) {
        return authService.resetPassword(request);
    }

}