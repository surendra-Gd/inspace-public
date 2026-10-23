package com.backend.demo.streak;

import com.backend.demo.member.SpaceMember;
import jakarta.persistence.*;
import jdk.jfr.Timestamp;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Entity
public class Streak {

    @Id
    @SequenceGenerator(
            name = "streak-seq",
            sequenceName = "streak-seq",
            allocationSize = 1
    )
    @GeneratedValue(
            strategy = GenerationType.SEQUENCE,
            generator = "streak-seq"
    )
    private Long id;
    private int count;
    @Timestamp
    private LocalDate timeStamp;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "memberId", referencedColumnName = "memberId", nullable = false)
    private SpaceMember memberId;
}