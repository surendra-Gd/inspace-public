package com.backend.demo.dto;

import com.backend.demo.common.PageResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.List;


@Getter
@Setter
@AllArgsConstructor
@Builder
public class PostResponseDTO {
    private List<EmojiDTO> emojis;
    private PageResponse<PostCommentResponse> comments;
}
