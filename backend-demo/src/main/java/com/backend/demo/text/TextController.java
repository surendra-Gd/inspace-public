package com.backend.demo.text;

import com.backend.demo.security.SpaceSecured;
import com.backend.demo.textresponse.TextMessageService;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/in-space/text")
@RequiredArgsConstructor
public class TextController {

    private final TextService textService;
    private final TextMessageService textMessageService;

    @GetMapping
    @SpaceSecured
    public ResponseEntity<?> getSpaceTexts(
            @RequestAttribute("memberId") @Min(1) Long memberId,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestAttribute("spaceId") Long spaceId
    ) {
        return textService.getTexts(spaceId, page, memberId);
    }

    @GetMapping("/{textId}/messages")
    @SpaceSecured
    public ResponseEntity<?> getSpaceTextMessages(
            @PathVariable("textId") @Min(1) Long textId,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestAttribute("spaceId") Long spaceId
    ) {
        return textMessageService.getTextMessages(textId, page, spaceId);
    }

    @GetMapping("/{textId}")
    @SpaceSecured
    public ResponseEntity<?> getTextById(
            @PathVariable("textId") @Min(1) Long textId,
            @RequestAttribute("spaceId") Long spaceId,
            @RequestAttribute("memberId") Long memberId
    ) {
       return textService.getTextById(textId, spaceId, memberId);
    }
}