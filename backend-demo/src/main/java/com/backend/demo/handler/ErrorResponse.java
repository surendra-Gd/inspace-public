package com.backend.demo.handler;


import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_EMPTY)
public class ErrorResponse {

    private Integer status;
    private String error;
    private String message;
    private Object response;

}
