package com.backend.demo.dto;

import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class HandleFriendRequestDTO {
    private String action;
    @Min(1)
    private Long targetId;
}
