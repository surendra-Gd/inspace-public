package com.backend.demo.dto;


import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeleteTextDTO {

    private Long textId;
    private Long memberId;
}
