package com.backend.demo.apirequest;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class EditSpaceRequest {

    @NotNull
    @Min(1)
    private Long spaceId;

    @NotBlank(message = "SpaceName is mandatory")
    @NotNull
    @Size(min = 6, max= 20, message = "SpaceName must be between 6 and 20 characters")
    @Pattern(regexp = "^(?!.*['\";\\\\*]).{6,20}$",
            message = "Space Name contain invalid characters."
    )
    private String spacename;
}
