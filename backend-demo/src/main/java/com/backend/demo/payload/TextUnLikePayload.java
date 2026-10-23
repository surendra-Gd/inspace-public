package com.backend.demo.payload;

import lombok.*;

import java.util.Map;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TextUnLikePayload {
    private Action action;
    private Map<String, Object> payload;
}
