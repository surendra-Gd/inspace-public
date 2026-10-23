package com.backend.demo.websocket;

import com.backend.demo.payload.Action;
import lombok.*;

@Getter
@Setter
@RequiredArgsConstructor
@AllArgsConstructor
@Builder
public class ErrorResponse {
    private int code;
    private String message;
    private Action action;
}