package com.backend.demo.payload;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.Map;

@Getter
@Setter
@Builder
public class TextLikePayload {
    private Action action;
    private Map<String, Object> payload;
}
