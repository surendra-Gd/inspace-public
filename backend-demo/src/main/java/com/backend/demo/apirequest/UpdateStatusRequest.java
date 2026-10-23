package com.backend.demo.apirequest;


import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class UpdateStatusRequest {

    @NotNull
    @Pattern(regexp = "^(?!.*['\";\\\\*])[\\s\\S]{1,100}$", message = "Status contains invalid characters. Please use a different one.")
    private String status;
}
