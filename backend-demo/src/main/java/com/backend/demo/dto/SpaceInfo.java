package com.backend.demo.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SpaceInfo {

    private Long spaceId;
    private String spacename;
    private String uniqueId;
    private UserDTO admin;
    private MemberDTO member;
}


// space data inside ps