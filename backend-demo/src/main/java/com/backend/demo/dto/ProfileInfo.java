package com.backend.demo.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class ProfileInfo {

    private int friendsCount;
    private int spacesCount;
    private List<SpaceDTO> spaces;
    private List<UserDTO> friends;
}

// DTO for information about friend
