package com.backend.demo.dto;

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
public class CreateSpaceRequest {

    @NotBlank(message = "SpaceId is mandatory")
    @NotNull
    @Size(min = 8, max = 20, message = "SpaceId must be between 8 and 20 characters")
    @Pattern(regexp = "^(?=.*[a-z])[a-z0-9_-]{8,20}$",
            message = "SpaceId must have at least one letter and " +
                    "can include letters, numbers, hyphens, or underscores")
    private String spaceId;

    @NotBlank(message = "SpaceName is mandatory")
    @NotNull
    @Size(min = 6, max= 20, message = "SpaceName must be between 6 and 20 characters")
    @Pattern(regexp = "^(?!.*['\";\\\\*]).{6,20}$",
            message = "Space Name contain invalid characters."
    )
    private String spaceName;
}
