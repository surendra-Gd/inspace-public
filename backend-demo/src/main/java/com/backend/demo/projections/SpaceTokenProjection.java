package com.backend.demo.projections;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SpaceTokenProjection {

    private Long memberId;
    private Long spaceId;

    public SpaceTokenProjection(Long memberId, Long spaceId) {
        this.memberId = memberId;
        this.spaceId = spaceId;
    }
}
