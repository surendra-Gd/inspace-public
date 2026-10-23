package com.backend.demo.dto;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ChangeEmailResponse {
    private String status;
    private String message;
    private String email;
}
