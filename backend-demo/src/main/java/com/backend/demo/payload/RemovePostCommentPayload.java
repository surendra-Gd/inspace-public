package com.backend.demo.payload;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Data
public class RemovePostCommentPayload {
    private Action action;
    private Long memberId;
    private Long postId;
    private Long commentId;
}
