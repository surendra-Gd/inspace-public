package com.backend.demo.common;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class ApiResponse {

    private int status;
    private String message;
    private Object payload;
}
