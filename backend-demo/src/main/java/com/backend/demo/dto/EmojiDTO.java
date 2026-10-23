package com.backend.demo.dto;

import com.backend.demo.emoji.Emojis;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class EmojiDTO {


    @NotNull
    @Min(1)
    private Long emojiId;

    @NotNull
    private Emojis emojis;

    @NotNull
    @Min(1)
    private Long emojiMember;

    @NotNull
    @Min(1)
    private Long postId;

}
