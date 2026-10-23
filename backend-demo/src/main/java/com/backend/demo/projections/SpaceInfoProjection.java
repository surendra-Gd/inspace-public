package com.backend.demo.projections;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SpaceInfoProjection {
    private Long spaceId;
    private String spaceName;
    private String uniqueId;
    private Long adminUserId;
    private String adminUsername;
    private String adminName;
    private String adminProfileUrl;
    private String adminStatus;

    public SpaceInfoProjection(Long spaceId, String spaceName, String uniqueId, Long adminUserId,
                               String adminUsername, String adminName, String adminProfileUrl,
                               String adminStatus) {
        this.spaceId = spaceId;
        this.spaceName = spaceName;
        this.uniqueId = uniqueId;
        this.adminUserId = adminUserId;
        this.adminUsername = adminUsername;
        this.adminName = adminName;
        this.adminProfileUrl = adminProfileUrl;
        this.adminStatus = adminStatus;
    }
}
