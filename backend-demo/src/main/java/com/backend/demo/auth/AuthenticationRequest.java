package com.backend.demo.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthenticationRequest {

    @NotBlank(message = "Username is required")
    @NotNull
    @Size(min = 6, max = 20, message = "Username must be between 6 and 20 characters")
    @Pattern(regexp = "^(?=.*[a-z])[a-z0-9._]{6,20}$",
            message = "Username must have at least one letter and can include letters, numbers, dots, or underscores")
    private String username;

    @NotBlank(message = "Password is required")
    @NotNull
    @Size(min = 8, max = 50, message = "Password must be between 8 and 50 characters")
    @Pattern(
            regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).{8,50}$",
            message = "Password must contain at least one digit, one lowercase letter and one uppercase letter"
    )
    private String password;

}