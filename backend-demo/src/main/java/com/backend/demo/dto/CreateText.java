package com.backend.demo.dto;


import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Builder
public class CreateText {

    @Pattern(regexp = "^(?!.*[;\\\\*])[\\s\\S]{1,720}$",
            message = "Text contains invalid characters or exceeds the allowed length.")
    private String text;

    private List<Long> tagged;
    private boolean isAnonymous;
    private Long memberId;
}
