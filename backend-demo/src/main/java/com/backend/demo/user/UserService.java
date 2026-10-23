package com.backend.demo.user;

import com.backend.demo.auth.RegisterRequest;
import com.backend.demo.dto.CurrentUserDTO;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Optional;

public interface UserService {
    User currentUser();

    ResponseEntity<?> changePassword(ChangePasswordRequest request);

    User signUpUser(RegisterRequest request);

    void enableUser(String email);

    Optional<User> getUserByEmail(String email);

    ResponseEntity<?> getProfileByUsername(String username);


    ResponseEntity<?> getUserBySearch(String username);

    // This exception is occurred on tools because the user never deletes their account
    // and also avoids locked users
    User getUserById(Long userId);

    CurrentUserDTO getCurrentUser();

    ResponseEntity<?> verifyUserPassword(String passwordInput);

    ResponseEntity<?> changeEmail(String email);

    ResponseEntity<?> changeEmailVerification(String token, String email);

    @Modifying
    @Transactional
    ResponseEntity<?> updateName(String name);

    @Modifying
    @Transactional
    ResponseEntity<?> updateUserStatus(String status);

    @Transactional
    ResponseEntity<?> updateAvatar(MultipartFile file) throws IOException;

    void removeAvatar();

    void addFeedback(String content);

    void updatePassword(Long userId, String password);
}