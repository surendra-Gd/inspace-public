package com.backend.demo.projections;


import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class SpaceNotificationProjection {
    private String uniqueId;
    private List<Long> members;

    public SpaceNotificationProjection(String uniqueId, List<Long> members) {
        this.uniqueId = uniqueId;
        this.members = members;
    }
}
