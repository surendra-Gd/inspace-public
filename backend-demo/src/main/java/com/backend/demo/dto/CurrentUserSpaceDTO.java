package com.backend.demo.dto;

import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class CurrentUserSpaceDTO {
    private Long spaceId;
    private String spacename;
    private String uniqueId;
    private boolean admin;
}
