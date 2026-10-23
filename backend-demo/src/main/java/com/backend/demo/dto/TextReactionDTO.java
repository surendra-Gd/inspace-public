package com.backend.demo.dto;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class TextReactionDTO {
    private Long memberId;
    private Long textId;
}
