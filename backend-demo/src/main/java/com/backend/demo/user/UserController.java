package com.backend.demo.user;

import com.backend.demo.apirequest.AuthVerificationRequest;
import com.backend.demo.apirequest.FeedbackRequest;
import com.backend.demo.apirequest.UpdateStatusRequest;
import com.backend.demo.apirequest.ValidatePasswordRequest;
import com.backend.demo.auth.AuthenticationService;
import com.backend.demo.exception.InvalidCredentialsException;
import com.backend.demo.exception.ResourceNotFoundException;
import com.backend.demo.security.ValidationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;


@RestController
@RequestMapping("api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final AuthenticationService authService;
    private final ValidationService validationService;


    @GetMapping("/me")
    public ResponseEntity<?> getUser() {
        var user = userService.getCurrentUser();
        return ResponseEntity.ok(user);
    }


    @GetMapping("/{username}")
    public ResponseEntity<?> getUserByUsername(
            @PathVariable("username") String username
    ) {
        var isValidUsername = validationService.isValidUsername(username);
        if(!isValidUsername) {
            throw new ResourceNotFoundException("username not found.");
        }
        return userService.getProfileByUsername(username);
    }


    @PutMapping("/change-password")
    public ResponseEntity<?> changePassword(
           @Valid @RequestBody ChangePasswordRequest request
    ) {
        return userService.changePassword(request);
    }


    @GetMapping("/search")
    public ResponseEntity<?> getUserBySearch(
            @RequestParam("query") String username
    ) {
        var isValidQuery = validationService.isValidSearchTerm(username);
        if(!isValidQuery) {
            return ResponseEntity.noContent().build();
        }
        return userService.getUserBySearch(username);
    }


    @PutMapping("/change-email")
    public ResponseEntity<?> changeEmail(
            @RequestParam("email") String email
    ) {
        var isEmailValid = validationService.isValidEmail(email);
        if(!isEmailValid) {
            throw new InvalidCredentialsException("Please give valid email");
        }
        return userService.changeEmail(email);
    }


    @PostMapping("/validate-password")
    public ResponseEntity<?> verifyPassword(
            @Valid @RequestBody ValidatePasswordRequest request
    ) {
        var password = request.getPassword();
        return userService.verifyUserPassword(password);
    }

    // Todo: change later!
    @PostMapping("/change-email-verification")
    public ResponseEntity<?> changeEmailVerification(
            @Valid @RequestBody AuthVerificationRequest request
    ) {
        var token = request.getToken();
        var email = request.getEmail();


        return userService.changeEmailVerification(token, email);
    }


    @PostMapping("/status")
    public ResponseEntity<?> updateBio(
            @Valid @RequestBody UpdateStatusRequest request
    ) {
        var status = request.getStatus();
        return userService.updateUserStatus(status);
    }


    @PutMapping("/name")
    public ResponseEntity<?> updateName(
            @RequestParam("name") String name
    ) {
        var isValidName = validationService.isValidName(name);
        if(!isValidName) {
            throw new InvalidCredentialsException("Name can only contain alphanumeric characters and spaces");
        }
        return userService.updateName(name);
    }


    @PutMapping("/username")
    public ResponseEntity<?> updateUsername(
            @RequestParam String username
    ) {
        var isValidUsername = validationService.isValidUsername(username);
        if(!isValidUsername) {
            throw new InvalidCredentialsException(
                    "Username must have at least one letter and can include letters, numbers, dots, or underscores"
            );
        }
        return authService.updateUsername(username);
    }


    @PutMapping(
            value = "/avatar",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<?> updateAvatar(
            @RequestParam("file") MultipartFile file
    ) throws IOException {
        return userService.updateAvatar(file);
    }


    @DeleteMapping("/avatar")
    public ResponseEntity<?> removeAvatar() {
        userService.removeAvatar();
        return ResponseEntity.ok().build();
    }


    @PostMapping("feedback")
    public ResponseEntity<?> handleFeedback(
            @Valid @RequestBody FeedbackRequest request
    ) {
        var content = request.getFeedback();
        userService.addFeedback(content);
        return ResponseEntity.ok().build();
    }

}