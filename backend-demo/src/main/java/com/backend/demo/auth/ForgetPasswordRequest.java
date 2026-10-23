package com.backend.demo.auth;

import jakarta.validation.constraints.*;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ForgetPasswordRequest {

    @NotNull
    @Pattern(regexp = "^\\d{7}$", message = "code must be exactly 7 digits.")
    private String code;


    @NotNull
    @Email(message = "Email is not valid. Please try again.")
    private String email;

    @NotBlank(message = "Password is required")
    @NotNull
    @Size(min = 8, max = 50, message = "Password must be between 8 and 50 characters")
    @Pattern(
            regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).{8,50}$",
            message = "Password must contain at least one digit, one lowercase letter and one uppercase letter"
    )
    private String password;

    @NotBlank(message = "Password is required")
    @NotNull
    @Size(min = 8, max = 50, message = "Password must be between 8 and 50 characters")
    @Pattern(
            regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).{8,50}$",
            message = "Password must contain at least one digit, one lowercase letter and one uppercase letter"
    )
    private String confirmPassword;
}