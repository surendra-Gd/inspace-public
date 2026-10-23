package com.backend.demo.apirequest;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FeedbackRequest {

    @NotBlank(message = "Error: Feedback required.")
    @Pattern(regexp = "^[^<>]{1,200}$",
            message = "Your feedback contains invalid characters or is too long"
    )
    private String feedback;
}
