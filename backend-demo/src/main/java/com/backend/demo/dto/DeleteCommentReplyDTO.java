package com.backend.demo.dto;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class DeleteCommentReplyDTO {
    private Long memberId;
    private Long parentId;
    private Long commentId;
}
