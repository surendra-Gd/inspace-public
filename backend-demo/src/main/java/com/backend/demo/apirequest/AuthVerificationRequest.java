package com.backend.demo.apirequest;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class AuthVerificationRequest {

    @NotNull
    @Pattern(regexp = "^\\d{7}$", message = "code must be exactly 7 digits.")
    private String token;

    @NotNull
    @Email(message = "Email is not valid. Please try again.")
    private String email;
}
