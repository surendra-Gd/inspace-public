package com.backend.demo.payload;


import lombok.*;

@Builder
@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class DeleteTextPayload {
    private Action action;
    private Long memberId;
    private Long textId;
    private Long spaceId;
}
