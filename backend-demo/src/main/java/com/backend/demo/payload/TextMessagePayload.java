package com.backend.demo.payload;

import com.backend.demo.dto.TextMessageDTO;
import lombok.*;


@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class TextMessagePayload {
    private Action action;
    private TextMessageDTO payload;
    private String text;
    private String profile;
}