package com.backend.demo.dto;

import com.backend.demo.postcomment.PostCommentType;
import lombok.*;

import java.time.LocalDateTime;


@Getter
@Setter
@Builder
@ToString
public class PostCommentResponse {
    private Long commentId;
    private String payload;
    private LocalDateTime commentedOn;
    private LocalDateTime lastUpdatedOn;
    private PostCommentType commentType = PostCommentType.COMMENT;
    private String prefixes;
    private Long postId;
    private Long memberId;
    private Long spaceId;
    private Integer replyCount;

    public PostCommentResponse() {}


    public PostCommentResponse(
            Long commentId,
            String payload,
            LocalDateTime commentedOn,
            LocalDateTime lastUpdatedOn,
            PostCommentType commentType,
            String prefixes,
            Long postId,
            Long memberId,
            Long spaceId,
            Integer replyCount
    ) {
        this.commentId = commentId;
        this.payload = payload;
        this.commentedOn = commentedOn;
        this.lastUpdatedOn = lastUpdatedOn;
        this.commentType = commentType;
        this.prefixes = prefixes;
        this.postId = postId;
        this.memberId = memberId;
        this.spaceId = spaceId;
        this.replyCount = replyCount;
    }



    public PostCommentResponse(
            Long commentId,
            String payload,
            LocalDateTime commentedOn,
            LocalDateTime lastUpdatedOn,
            Long postId,
            Long memberId,
            Long spaceId,
            Integer replyCount
    ) {
        this.commentId = commentId;
        this.payload = payload;
        this.commentedOn = commentedOn;
        this.lastUpdatedOn = lastUpdatedOn;
        this.postId = postId;
        this.memberId = memberId;
        this.spaceId = spaceId;
        this.replyCount = replyCount;
    }

}