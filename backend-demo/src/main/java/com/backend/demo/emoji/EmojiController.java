package com.backend.demo.emoji;

import com.backend.demo.dto.EmojiDTO;
import com.backend.demo.security.SpaceSecured;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("api/v1/in-space/emojis")
@RequiredArgsConstructor
public class EmojiController {

    private final EmojiService emojiService;

    @PostMapping("/add")
    @SpaceSecured
    public ResponseEntity<?> addEmoji(
            @RequestAttribute("spaceId") Long spaceId,
            @RequestAttribute("memberId") Long memberId,
            @RequestBody EmojiDTO payload
    ) {
        var response = emojiService.addEmoji(payload, spaceId, memberId);
        return ResponseEntity.ok(response);
    }


    @DeleteMapping("/{emojiId}")
    @SpaceSecured
    public void deleteEmojiById(
            @PathVariable("emojiId") @Min(1) Long emojiId,
            @RequestAttribute("memberId") Long memberId
    ) {
        emojiService.removeEmoji(emojiId, memberId);
    }

}
