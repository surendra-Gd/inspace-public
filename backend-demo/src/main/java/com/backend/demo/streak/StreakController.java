package com.backend.demo.streak;

import com.backend.demo.security.SpaceSecured;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/in-space/streak")
@RequiredArgsConstructor
public class StreakController {

    private final StreakService streakService;

    @GetMapping("/{memberId}")
    @SpaceSecured
    public ResponseEntity<?> getStreaks(
            @PathVariable("memberId") Long memberId,
            @RequestParam("page") @Min(0) int page,
            @RequestAttribute("spaceId") Long spaceId
    ) {
        return streakService.getStreaksByMemberId(memberId, page, spaceId);
    }
}
