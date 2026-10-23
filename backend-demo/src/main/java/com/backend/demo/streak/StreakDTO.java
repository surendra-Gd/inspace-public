package com.backend.demo.streak;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class StreakDTO {
    private Long id;
    private int streak;
    private Long memberId;
    private LocalDate timeStamp;

    public StreakDTO() {}

    public StreakDTO(Long id, int streak, Long memberId, LocalDate timeStamp) {
        this.id = id;
        this.streak = streak;
        this.memberId = memberId;
        this.timeStamp = timeStamp;
    }
}
