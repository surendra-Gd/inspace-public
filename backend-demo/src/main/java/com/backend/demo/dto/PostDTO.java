package com.backend.demo.dto;

import lombok.*;

import java.time.LocalDateTime;


@Getter
@Setter
@Builder
@AllArgsConstructor
@RequiredArgsConstructor
public class PostDTO {

    private Long postId;
    private String image;
    private String caption;
    private LocalDateTime sharedOn;
    private int width;
    private int height;
    private String aspectRatio;
    private Long memberId;
    private Long spaceId;

}

// DTO for reference post