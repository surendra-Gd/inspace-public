package com.backend.demo.projections;


import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SpaceCardProjection {
    private Long spaceId;
    private String spacename;
    private String uniqueId;
    private Long adminId;

    public SpaceCardProjection(Long spaceId,
                               String spacename,
                               String uniqueId,
                               Long adminId) {
        this.spaceId = spaceId;
        this.spacename = spacename;
        this.uniqueId = uniqueId;
        this.adminId = adminId;
    }
}
