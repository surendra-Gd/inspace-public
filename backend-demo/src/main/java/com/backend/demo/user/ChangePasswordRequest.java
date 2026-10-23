package com.backend.demo.user;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ChangePasswordRequest {

    @NotBlank(message = "Current Password is required")
    @NotNull
    @Size(min = 8, max = 50, message = "Password must be between 8 and 50 characters")
    @Pattern(
            regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).{8,50}$",
            message = "Password must contain at least one digit, one lowercase letter and one uppercase letter"
    )
    private String currentPassword;
    @NotBlank(message = "New Password is required")
    @NotNull
    @Size(min = 8, max = 50, message = "Password must be between 8 and 50 characters")
    @Pattern(
            regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).{8,50}$",
            message = "Password must contain at least one digit, one lowercase letter and one uppercase letter"
    )
    private String newPassword;
    @NotBlank(message = "Confirm Password is required")
    @NotNull
    @Size(min = 8, max = 50, message = "Password must be between 8 and 50 characters")
    @Pattern(
            regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).{8,50}$",
            message = "Password must contain at least one digit, one lowercase letter and one uppercase letter"
    )
    private String confirmationPassword;

}
