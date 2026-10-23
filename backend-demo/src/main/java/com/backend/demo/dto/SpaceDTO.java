package com.backend.demo.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SpaceDTO {

    private Long spaceId;
    private String spacename;
    private String uniqueId;
}

// space data in outside ps
