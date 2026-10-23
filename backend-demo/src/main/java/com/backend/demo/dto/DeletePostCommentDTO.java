package com.backend.demo.dto;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class DeletePostCommentDTO {
    private Long postId;
    private Long memberId;
    private Long commentId;
}
