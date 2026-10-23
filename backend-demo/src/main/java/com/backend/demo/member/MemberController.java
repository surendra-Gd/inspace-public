package com.backend.demo.member;

import com.backend.demo.security.SpaceSecured;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("api/v1/in-space/members")
@RequiredArgsConstructor
public class MemberController {

    private final MemberService memberService;


    @GetMapping
    @SpaceSecured
    public ResponseEntity<?> getSpaceMembers(
            @RequestAttribute("spaceId") Long spaceId
    ) {
        return memberService.getAllMembersBySpaceId(spaceId);
    }



    // Todo: Unique error details for frontend logic to identify the error type
    @GetMapping("/{memberId}")
    @SpaceSecured
    public ResponseEntity<?> getMemberById(
            @PathVariable("memberId") @Min(1) Long targetMemberId,
            @RequestAttribute("spaceId") Long spaceId
    ) {
        return memberService.getMemberById(targetMemberId, spaceId);
    }

}