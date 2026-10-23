package com.backend.demo.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class LeaveRequest {

    @Min(1)
    private Long memberId;

    @Min(1)
    private Long spaceId;

    @NotBlank
    @NotNull
    @Pattern(regexp = "^[^<>]{1,200}$",
            message = "Your feedback contains invalid characters or is too long")
    private String feedback;
}
