package com.backend.demo.apirequest;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class RemoveMemberRequest {

    @NotNull
    @Min(1)
    private Long memberId;

    @NotBlank(message = "Error: Feedback required.")
    @Pattern(regexp = "^[^<>]{1,200}$",
            message = "Your feedback contains invalid characters or is too long"
    )
    private String feedback;
}
