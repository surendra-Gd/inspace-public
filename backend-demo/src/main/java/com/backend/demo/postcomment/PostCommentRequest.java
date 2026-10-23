package com.backend.demo.postcomment;

import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.validation.constraints.Pattern;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Data
public class PostCommentRequest {
    private Long postId;

    @Pattern(regexp = "^(?!.*[;\\\\*])[\\s\\S]{1,720}$",
            message = "Comment contains invalid characters or exceeds the allowed length.")
    private String payload;
    private String prefix;
    private Long parentId;
    @Enumerated(value = EnumType.STRING)
    private PostCommentType commentType;
    private Long memberId;
}
