package com.backend.demo.dto;

import com.backend.demo.spacerequest.Status;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SpaceRequestStatus {

    @NotNull(message = "requestId is mandatory")
    private Long requestId;
    private Status status;
}

// DTO for space request status in friend spaces and join space modal
// DTO for request action by space admin to requester
