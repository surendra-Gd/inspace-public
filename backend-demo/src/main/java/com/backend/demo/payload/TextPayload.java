package com.backend.demo.payload;

import com.backend.demo.dto.TextDTO;
import lombok.*;


@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class TextPayload {
    private Action action;
    private TextDTO payload;
    private int streak;
    private String userName;
    private String profile;
    private Long userId;
}
