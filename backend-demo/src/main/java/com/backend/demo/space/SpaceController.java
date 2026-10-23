package com.backend.demo.space;

import com.backend.demo.apirequest.DeleteSpaceRequest;
import com.backend.demo.apirequest.EditSpaceRequest;
import com.backend.demo.apirequest.RemoveMemberRequest;
import com.backend.demo.dto.CreateSpaceRequest;
import com.backend.demo.dto.LeaveRequest;
import com.backend.demo.dto.SpaceRequestStatus;
import com.backend.demo.exception.InvalidCredentialsException;
import com.backend.demo.member.MemberService;
import com.backend.demo.security.SpaceSecured;
import com.backend.demo.security.ValidationService;
import com.backend.demo.spacerequest.SpaceRequestService;
import com.backend.demo.spacerequest.Status;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("api/v1/in-space/space")
@RequiredArgsConstructor
public class SpaceController {

    private final SpaceService spaceService;
    private final ValidationService validationService;
    private final MemberService memberService;
    private final SpaceRequestService requestService;


    @GetMapping("/{spaceId}/current")
    public ResponseEntity<?> getCurrentMember(
            @PathVariable("spaceId") @Min(1) Long spaceId
    ) {
        return memberService.getMemberBySpaceId(spaceId);
    }


    @GetMapping("/{spaceId}/members/count")
    public ResponseEntity<?> getMemberCount(
            @PathVariable("spaceId") @Min(1) Long spaceId
    ) {
        return memberService.getMembersCountById(spaceId);
    }

    @GetMapping("/mine")
    public ResponseEntity<?> getUserSpaces() {
        return spaceService.getCurrentUserSpaces();
    }

    @GetMapping("/{uniqueId}")
    public ResponseEntity<?> getSpace(
            @PathVariable("uniqueId") String uniqueId
    ) {
        if(validationService.isSpaceIdValid(uniqueId)) {
            throw new InvalidCredentialsException("Invalid space id provided.");
        }
        return spaceService.getSpaceForJoin(uniqueId);
    }

    @PostMapping("/create")
    public ResponseEntity<?> createSpace(
            @Valid @RequestBody CreateSpaceRequest request
    ) {
        var response = spaceService.createSpace(request);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/update")
    public ResponseEntity<?> updateSpacename(
            @Valid @RequestBody EditSpaceRequest request
    ) {
        var spaceId = request.getSpaceId();
        var spacename = request.getSpacename();

        var response = spaceService.updateSpacename(spaceId, spacename);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/requests")
    @SpaceSecured
    public ResponseEntity<?> getSpaceRequests(
            @RequestAttribute("spaceId") Long spaceId
    ) {
        return requestService.getRequestsBySpaceId(spaceId);
    }

    @PostMapping("/requests/handle")
    @SpaceSecured
    public ResponseEntity<?> handleSpaceRequest(
            @Valid @RequestBody SpaceRequestStatus payload,
            @RequestAttribute("spaceId") Long spaceId
    ) {
        Long requestId = payload.getRequestId();
        Status action = payload.getStatus();
        return requestService.handleSpaceRequest(requestId, action, spaceId);
    }


    @PutMapping("/delete")
    public ResponseEntity<?> deleteSpace(
            @Valid @RequestBody DeleteSpaceRequest request
    ) {
        var spaceId = request.getSpaceId();
        var feedback = request.getFeedback();
        return spaceService.deleteSpace(spaceId, feedback);
    }

    @PutMapping("/leave")
    public ResponseEntity<?> leaveMemberFromSpace(
            @Valid @RequestBody LeaveRequest request
    ) {
        spaceService.leaveSpace(request.getMemberId(), request.getSpaceId(), request.getFeedback());
        return ResponseEntity.noContent().build();
    }


    @PutMapping("/shift-admin")
    @SpaceSecured
    public ResponseEntity<?> shiftAdmin(
            @RequestParam("target") @Min(1) Long targetMember,
            @RequestAttribute("memberId") Long memberId,
            @RequestAttribute("spaceId") Long spaceId
    ) {
        spaceService.shiftAdmin(targetMember, memberId, spaceId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/remove")
    @SpaceSecured
    public ResponseEntity<?> removeMember(
            @Valid @RequestBody RemoveMemberRequest request,
            @RequestAttribute("spaceId") Long spaceId
    ) {
        var memberId = request.getMemberId();
        var feedback = request.getFeedback();

        return spaceService.removeMember(memberId, spaceId, feedback);
    }

    @GetMapping("/count")
    @SpaceSecured
    public ResponseEntity<?> getSpaceRequestsCount(
            @RequestAttribute("spaceId") Long spaceId
    ) {
        return requestService.getUnseenRequestsCount(spaceId);
    }

    @PutMapping("/mark-seen")
    @SpaceSecured
    public ResponseEntity<?> updateUnseenSpaceRequest(
            @RequestAttribute("spaceId") Long spaceId
    ) {
        requestService.updateUnseenSpaceRequests(spaceId);
        return ResponseEntity.ok().build();
    }
}
