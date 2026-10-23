package com.backend.demo.projections;


import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class SpaceProjection {

    private Long spaceId;
    private String spaceName;
    private Long adminId;

}
