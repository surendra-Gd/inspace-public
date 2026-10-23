package com.backend.demo.user;


import com.backend.demo.auth.RegisterRequest;
import com.backend.demo.dto.*;
import com.backend.demo.email.EmailSender;
import com.backend.demo.email.EmailTemplateName;
import com.backend.demo.email.email_token.ConfirmationToken;
import com.backend.demo.email.email_token.ConfirmationTokenService;
import com.backend.demo.exception.*;
import com.backend.demo.friend.FriendService;
import com.backend.demo.post.ImageService;
import com.backend.demo.redis.UserCacheService;
import com.backend.demo.s3.S3Service;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.Marker;
import org.slf4j.MarkerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final FriendService friendService;
    private final PasswordEncoder passwordEncoder;
    private final ConfirmationTokenService tokenService;
    private final EmailSender emailService;
    private final DTOMapper mapper;
    private final S3Service s3Service;
    private final ImageService imageService;
    private final EmailSender emailSender;
    private final UserCacheService cacheService;

    private static final Logger logger = LoggerFactory.getLogger(UserServiceImpl.class);
    private static final Marker USER_BASE = MarkerFactory.getMarker("USER_BASE");


    @Value("${aws.s3.buckets.avatar}")
    private String bucket;
    @Value("${aws.s3.default.key}")
    private String defaultUserProfileKey;
    @Value("${aws.s3.default.user}")
    private String defaultUserProfileUrl;
    

    public UserServiceImpl(UserRepository userRepository,
                           @Lazy FriendService friendService,
                           PasswordEncoder passwordEncoder,
                           ConfirmationTokenService tokenService,
                           EmailSender emailService,
                           S3Service s3Service,
                           DTOMapper mapper,
                           ImageService imageService,
                           EmailSender emailSender,
                           UserCacheService cacheService
    ) {
        this.userRepository = userRepository;
        this.friendService = friendService;
        this.passwordEncoder = passwordEncoder;
        this.tokenService = tokenService;
        this.emailService = emailService;
        this.s3Service = s3Service;
        this.mapper = mapper;
        this.imageService = imageService;
        this.emailSender = emailSender;
        this.cacheService = cacheService;
    }

    @Override
    public User currentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return (User) auth.getPrincipal();
    }


    @Override
    public ResponseEntity<?> changePassword(ChangePasswordRequest request) {
        var user = currentUser();
        if(!request.getNewPassword().equals(request.getConfirmationPassword())) {
            throw new PasswordValidateException("Passwords does not match");
        }
        if(!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new PasswordValidateException("Your current password is wrong");
        }
        if(request.getCurrentPassword().equals(request.getNewPassword())) {
            return ResponseEntity.ok().build();
        }
        var newPassword = passwordEncoder.encode(request.getNewPassword());
        user.setPassword(newPassword);
        userRepository.save(user);
        cacheService.evictUserCache(user.getUsername());
        return ResponseEntity.ok().build();
    }


    @Override
    public User signUpUser(RegisterRequest request) {
        var user = User.builder()
                .username(request.getUsername())
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .profileUrl(defaultUserProfileUrl)
                .objectKey(defaultUserProfileKey)
                .accountLocked(false)
                .enabled(false)
                .role(Role.USER)
                .build();
        try {
            var savedUser = userRepository.save(user);
            System.out.println("user creation: " + savedUser.getUserId());
            return savedUser;
        } catch (Exception e) {
            throw new DatabaseOperationException(e.getMessage(),
                    "There is an error occurred on signUpUser in UserService at save operation" +
                            " -P %s".formatted(user.toString())
            );
        }
    }

    private String generateObjectKey(String type) {
        var characters = "1234567890abcdefghijklmnopqrstuvwxyz";
        SecureRandom secureRandom = new SecureRandom();
        var extension = imageService.determineExtension(type);
        String key;
        do {
            StringBuilder codeBuilder = new StringBuilder();
            for (int i = 0; i < 75; i++) {
                int randomIndex = secureRandom.nextInt(characters.length());
                codeBuilder.append(characters.charAt(randomIndex));
            }
            key = codeBuilder + extension;
        } while (userRepository.existsByObjectKey(key));
        return key;
    }

    @Override
    public void enableUser(String email) {
        userRepository.enableUser(email);
    }

    @Override
    public Optional<User> getUserByEmail(String email) {
        try {
            return userRepository.findByEmail(email);
        } catch (Exception e) {
            throw new DatabaseOperationException(e.getMessage(),
                    "There is an error occurred on getUserByEmail in UserService by get operation" +
                            " -P %s".formatted(email)
            );
        }
    }

    @Override
    public ResponseEntity<?> getProfileByUsername(String username) {
        Long currentUser = currentUser().getUserId();
        UserDTO target = userRepository.getUserDtoByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "%s not found".formatted(username)
                ));
        Long friendsId = friendService.getFriendsIdByUserId(currentUser, target.getUserId());
        ProfileDTO profile = ProfileDTO.builder()
                .user(target)
                .friendsId(friendsId)
                .areFriends(friendsId != null && friendsId > 0)
                .build();
        return ResponseEntity.ok(profile);
    }

    @Override
    public ResponseEntity<?> getUserBySearch(String username) {
        try {
            List<UserDTO> users = userRepository
                    .findAllByUsernameStartingWithIgnoreCase(username)
                    .stream()
                    .filter(User::isEnabled)
                    .map(mapper::mapToUserDTO)
                    .toList();
            return ResponseEntity.ok(users);
        }  catch (Exception e) {
            throw new DatabaseOperationException(e.getMessage(),
                    "There is an error occurred on getUserBySearch in UserService by get operation" +
                            " -P %s".formatted(username)
            );
        }
    }


    @Override
    public User getUserById(Long userId) {
        try {
            return userRepository.findByUserId(userId)
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "user with id %s not found".formatted(userId)
                    ));
        } catch (Exception e) {
            throw new DatabaseOperationException(e.getMessage(),
                    "There is an error occurred in getUserById on UserService by get operation" +
                            " -P %s".formatted(userId)
            );
        }
    }

    @Override
    public CurrentUserDTO getCurrentUser() {
        var user = currentUser();
        return new CurrentUserDTO(
                user.getUserId(),
                user.getUsername(),
                user.getName(),
                user.getEmail(),
                user.getProfileUrl(),
                user.getStatus()
        );
    }

    @Override
    public ResponseEntity<?> verifyUserPassword(String passwordInput) {
        var encodedPassword = currentUser().getPassword();
        if(!passwordEncoder.matches(passwordInput, encodedPassword)) {
            throw new PasswordValidateException("The provided password is incorrect. Please try again.");
        }
        return ResponseEntity.ok().build();
    }


    @Override
    public ResponseEntity<?> changeEmail(String email) {
        boolean emailExists = userRepository.existsByEmail(email);
        if(emailExists) {
           throw new ResourceFoundException("This email is already registered. Please use a different email.");
        }
        var user = currentUser();
        String token = tokenService.generateAndSaveToken(user, email);
        var templateName = EmailTemplateName.VERIFY_EMAIL.getName();
        var subject = EmailTemplateName.VERIFY_EMAIL.getSubject();
        Map<String, String> variables = new HashMap<>();
        variables.put("username", user.getUsername());
        variables.put("activation_code", token);

        emailSender.sendEmail(email, subject, templateName, variables);
        return ResponseEntity.ok("We send Verification code to your provided email");
    }


    @Override
    public ResponseEntity<?> changeEmailVerification(String token, String email) {
        ConfirmationToken savedToken = tokenService.getToken(token).orElse(null);

        if(savedToken == null || !Objects.equals(savedToken.getSendEmail(), email)) {
            throw new ResourceNotFoundException(
                    "The verification code is invalid or has already been used. Please request a new verification email."
            );
        }
        if (savedToken.isValidated()) {
            throw new ResourceFoundException("Email is already verified");
        }
        if (isTokenExpired(savedToken)) {
            throw new InvalidCredentialsException("The verification code has expired. Please request a new verification email.");
        }

        var user = savedToken.getUser();
        try {
            user.setEmail(savedToken.getSendEmail());
            userRepository.save(user);
            tokenService.setConfirmedAt(token);
            cacheService.evictUserCache(user.getUsername());
            var response = ChangeEmailResponse.builder()
                    .message("Your email address has been successfully changed.")
                    .email(savedToken.getSendEmail())
                    .status("ok")
                    .build();

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            throw new DatabaseOperationException(e.getMessage(),
                    "There is an error occurred on changeEmailVerification in UserService by save operation " +
                            "-P %s ".formatted(user.toString())
            );
        }
    }

    private boolean isTokenExpired(ConfirmationToken token) {
        return (token.isValidated() || token.isRevoked()
                || LocalDateTime.now().isAfter(token.getExpiresAt()));
    }

    @Modifying
    @Transactional
    @Override
    public ResponseEntity<?> updateName(String name) {
        var user = currentUser();
        if(user.getName().equals(name)) {
            return ResponseEntity.ok(name);
        }
        user.setName(name);
        try {
            userRepository.save(user);
            cacheService.evictUserCache(user.getUsername());
            return ResponseEntity.ok(name);
        } catch (Exception e) {
            throw new DatabaseOperationException(e.getMessage(),
                    "There is an error occurred on updateName in UserService by save operation" +
                            " -P %s".formatted(user.toString())
            );
        }
    }

    @Modifying
    @Transactional
    @Override
    public ResponseEntity<?> updateUserStatus(String status) {
        var user = currentUser();
        if(user.getStatus() != null && user.getStatus().equals(status)) {
            return ResponseEntity.ok(status);
        }
        user.setStatus(status);
        try {
            userRepository.save(user);
            cacheService.evictUserCache(user.getUsername());
            return ResponseEntity.ok(status);
        } catch (Exception e) {
            throw new DatabaseOperationException(e.getMessage(),
                    "There is an error occurred on updateUserStatus in UserService by save " +
                            "-P %s".formatted(user.toString())
            );
        }
    }



    @Transactional
    @Override
    public ResponseEntity<?> updateAvatar(MultipartFile file) throws IOException {
        if(file.isEmpty()) {
            throw new ResourceNotFoundException("sorry! Image is not found in change avatar operation. Please try again later.");
        }
        imageService.processImage(file);
        var user = currentUser();
        String key = user.getObjectKey();
        String type = imageService.detectMimeType(file.getInputStream());
        if(Objects.equals(key, defaultUserProfileKey)) {
            key = generateObjectKey(type);
            user.setObjectKey(key);
        }
        s3Service.putObject(bucket, key, file, "max-age=5184000, public", type);
        String url = s3Service.getPublicUrl(bucket, key);
        var timeStamp = LocalDateTime.now();
        user.setProfileUrl("%s?t=%s".formatted(url,timeStamp));
        try {
            var response = userRepository.save(user).getProfileUrl();
            cacheService.evictUserCache(user.getUsername());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            throw new DatabaseOperationException(e.getMessage(),
                    "There is an error occurred on updateAvatar in UserService by save " +
                            "-P %s".formatted(user.toString())
            );
        }
    }

    @Override
    public void removeAvatar() {
        var user = currentUser();
        String key = user.getObjectKey();
        if(Objects.equals(key, defaultUserProfileKey)) return;
        s3Service.deleteObject(key, null, bucket);
        user.setObjectKey(defaultUserProfileKey);
        user.setProfileUrl(defaultUserProfileUrl);
        try {
            userRepository.save(user);
            cacheService.evictUserCache(user.getUsername());
        } catch (Exception e) {
            throw new DatabaseOperationException(e.getMessage(),
                    "There is an error occurred on removeAvatar in UserService by save " +
                            "-P %s".formatted(user.toString())
            );
        }
    }

    @Override
    public void addFeedback(String content) {
        var user = getCurrentUser();
        var description = "user:%s, provided the feedback".formatted(user.getUserId());

        emailService.sendUserFeedBack(
                user.getUsername(),
                "General feedback from user",
                content,
                description
        );
    }

    @Override
    public void updatePassword(Long userId, String password) {
        var encodedPassword = passwordEncoder.encode(password);
        userRepository.updatePassword(userId, encodedPassword);
    }
}