package com.backend.demo.projections;


import com.backend.demo.member.MemberType;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.Objects;

@Getter
@Setter
public class MemberInfoProjection {

    private Long memberId;
    private Long spaceId;
    private LocalDate joinedOn;
    private MemberType memberType;
    private Long userId;
    private String username;
    private String name;
    private String profile;
    private String status;
    private int streak;
    private int lastStreak;

    public MemberInfoProjection(Long memberId,
                                Long spaceId,
                                LocalDate joinedOn,
                                MemberType memberType,
                                Long userId,
                                String username,
                                String name,
                                String profile,
                                String status,
                                int streak,
                                LocalDate lastStreakModifiedOn,
                                int lastStreak) {
        this.memberId = memberId;
        this.spaceId = spaceId;
        this.joinedOn = joinedOn;
        this.memberType = memberType;
        this.userId = userId;
        this.username = username;
        this.name = name;
        this.profile = profile;
        this.status = status;
        this.streak = streak;
        this.lastStreak = Objects.equals(lastStreakModifiedOn, LocalDate.now()) ? lastStreak : 0;
    }
}
