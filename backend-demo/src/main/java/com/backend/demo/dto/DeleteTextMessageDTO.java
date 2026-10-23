package com.backend.demo.dto;


import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class DeleteTextMessageDTO {
    private Long textId;
    private Long memberId;
    private Long messageId;
}
