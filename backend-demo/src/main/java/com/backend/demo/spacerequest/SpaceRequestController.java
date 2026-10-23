package com.backend.demo.spacerequest;

import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("api/v1/space-requests")
@RequiredArgsConstructor
public class SpaceRequestController {

    private final SpaceRequestService requestService;


    @PostMapping("/{spaceId}/add")
    public ResponseEntity<?> addSpaceRequest(
            @PathVariable("spaceId") @Min(1) Long spaceId
    ) {
        var response = requestService.addSpaceRequest(spaceId);
        return ResponseEntity.ok(response);
    }


    @DeleteMapping("/{requestId}/remove")
    public void removeSpaceRequest(
            @PathVariable("requestId") @Min(1) Long requestId
    ) {
        requestService.removeSpaceRequest(requestId);
    }



    @GetMapping("/{spaceId}/status")
    public ResponseEntity<?> getRequestByUserIdAndSpaceId(
            @PathVariable("spaceId") @Min(1) Long spaceId
    ) {
        return requestService.getRequestBySpaceIdAndUserId(spaceId);
    }

}