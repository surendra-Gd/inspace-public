package com.backend.demo.dto;


import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ResponseObject {

    private int status;
    private String code;
    private String message;
}
