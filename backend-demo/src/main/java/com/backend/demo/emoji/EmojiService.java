package com.backend.demo.emoji;

import com.backend.demo.dto.EmojiDTO;
import org.springframework.http.ResponseEntity;

import java.util.List;

public interface EmojiService {
    List<EmojiDTO> getEmojisByPost(Long postId, Long spaceId);

    // Todo: We try to do this later after completing the actions and inputs.
    Long addEmoji(EmojiDTO emojiDto, Long spaceId, Long memberId);

    void removeEmoji(Long emojiId, Long memberId);

    void removeEmojisByMember(Long memberId);
}
