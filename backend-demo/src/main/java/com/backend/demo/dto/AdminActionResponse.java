package com.backend.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;


@Getter
@Setter
@AllArgsConstructor
public class AdminActionResponse {
    private Long memberId;
    private Long activityId;
    private LocalDate joinedOn;
}
