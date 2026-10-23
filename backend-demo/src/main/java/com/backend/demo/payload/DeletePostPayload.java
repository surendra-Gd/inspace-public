package com.backend.demo.payload;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class DeletePostPayload {

    private Action action;
    private Long postId;
    private Long memberId;
    private Long spaceId;
}