package com.backend.demo.dto;


import com.backend.demo.postcomment.PostCommentType;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class PostCommentDTO {

    private Long commentId;
    private String payload;
    private Long parentId;
    private LocalDateTime commentedOn;
    private PostCommentType commentType = PostCommentType.REPLY;
    private String prefixes;
    private Long postId;
    private Long memberId;
    private Long spaceId;
    private LocalDateTime lastUpdatedOn;


    public PostCommentDTO(
            Long commentId,
            String payload,
            Long parentId,
            LocalDateTime commentedOn,
            String prefixes,
            Long postId,
            Long memberId,
            Long spaceId,
            LocalDateTime lastUpdatedOn
    ) {
        this.commentId = commentId;
        this.payload = payload;
        this.parentId = parentId;
        this.commentedOn = commentedOn;
        this.prefixes = prefixes;
        this.postId = postId;
        this.memberId = memberId;
        this.spaceId = spaceId;
        this.lastUpdatedOn = lastUpdatedOn;
    }
}
