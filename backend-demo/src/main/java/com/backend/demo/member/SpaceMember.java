package com.backend.demo.member;

import com.backend.demo.streak.Streak;
import com.backend.demo.user.User;
import com.backend.demo.space.Space;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jdk.jfr.Timestamp;
import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "space_member", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"space", "member"})
})
@ToString(exclude = {"streaks"})
public class SpaceMember {

    @Id
    @GeneratedValue(
            strategy = GenerationType.SEQUENCE,
            generator = "member-seq"
    )
    @SequenceGenerator(
            name= "member-seq",
            sequenceName = "member-seq",
            allocationSize = 1
    )
    private Long memberId;

    @ManyToOne
    @JoinColumn(
            name = "space",
            referencedColumnName = "spaceId",
            nullable = false
    )
    private Space space;
    @ManyToOne
    @JoinColumn(
            name = "member",
            referencedColumnName = "userId",
            nullable = false
    )
    private User member;
    @Enumerated(value = EnumType.STRING)
    private MemberStatus memberStatus;
    @Timestamp
    private LocalDate joinedOn;
    @Enumerated(value = EnumType.STRING)
    private MemberType memberType;
    private int totalStreak;
    @Timestamp
    private LocalDate lastStreakModified;
    private int lastStreak;
    @OneToMany(mappedBy = "memberId", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    @JsonIgnore
    private List<Streak> streaks;
}