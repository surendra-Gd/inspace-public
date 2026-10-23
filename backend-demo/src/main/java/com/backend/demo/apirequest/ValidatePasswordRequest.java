package com.backend.demo.apirequest;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ValidatePasswordRequest {

    @NotBlank(message = "Password is required")
    @NotNull
    @Size(min = 8, max = 50, message = "Password must be between 8 and 50 characters")
    @Pattern(
            regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).{8,50}$",
            message = "Password must contain at least one digit, one lowercase letter and one uppercase letter"
    )
    private String password;
}
