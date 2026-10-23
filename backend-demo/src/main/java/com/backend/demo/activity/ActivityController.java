package com.backend.demo.activity;


import com.backend.demo.security.SpaceSecured;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("api/v1/in-space/activities")
@RequiredArgsConstructor
public class ActivityController {

    private final ActivityService activityService;


    @GetMapping
    @SpaceSecured
    public ResponseEntity<?> getAllBySpaceId(
            @RequestAttribute("spaceId") Long spaceId,
            @RequestParam(defaultValue = "0") @Min(0) int page
    ) {
        var response = activityService
                .getActivitiesBySpaceId(spaceId, page);
        return ResponseEntity.ok(response);
    }

}
