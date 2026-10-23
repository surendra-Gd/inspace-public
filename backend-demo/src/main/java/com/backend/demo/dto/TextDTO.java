package com.backend.demo.dto;


import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
public class TextDTO {
    private Long textId;
    private String text;
    private Long memberId;
    private List<Long> tagged;
    private Long spaceId;
    private LocalDateTime createdOn;
    private boolean isAnonymous;
    private Long messagesCount;
    private Long likesCount;
    private LocalDateTime lastUpdatedOn;
    private boolean isLiked;
    private boolean fullConstructor;


    public TextDTO() {}


    public TextDTO(
            Long textId,
            String text,
            Long memberId,
            String tagged,
            Long spaceId,
            LocalDateTime createdOn,
            Boolean isAnonymous,
            Long messagesCount,
            Long likesCount,
            LocalDateTime lastUpdatedOn,
            Boolean isLiked
    ) {
        this.textId = textId;
        this.text = text;
        this.memberId = memberId;
        this.tagged =  tagged != null ? Arrays.stream(tagged.split(","))
                .map(Long::valueOf)
                .collect(Collectors.toList()) : Collections.emptyList();
        this.spaceId = spaceId;
        this.createdOn = createdOn;
        this.isAnonymous = isAnonymous;
        this.messagesCount = messagesCount;
        this.likesCount = likesCount;
        this.lastUpdatedOn = lastUpdatedOn;
        this.isLiked = isLiked;
    }

    public TextDTO(
            Long textId,
            String text,
            Long memberId,
            List<Long> tagged,
            Long spaceId,
            LocalDateTime createdOn,
            Boolean isAnonymous,
            Long messagesCount,
            Long likesCount,
            LocalDateTime lastUpdatedOn,
            Boolean isLiked,
            Boolean fullConstructor
    ) {
        this.textId = textId;
        this.text = text;
        this.memberId = memberId;
        this.tagged = tagged;
        this.spaceId = spaceId;
        this.createdOn = createdOn;
        this.isAnonymous = isAnonymous;
        this.messagesCount = messagesCount;
        this.likesCount = likesCount;
        this.lastUpdatedOn = lastUpdatedOn;
        this.isLiked = isLiked;
        this.fullConstructor = fullConstructor;
    }
}