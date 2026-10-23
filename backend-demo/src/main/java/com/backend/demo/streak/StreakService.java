package com.backend.demo.streak;

import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.http.ResponseEntity;

public interface StreakService {
    ResponseEntity<?> getStreaksByMemberId(Long memberId, int page, Long spaceId);

    @Transactional
    @Modifying
    int addTodayStreak(int len, Long memberId);
}
