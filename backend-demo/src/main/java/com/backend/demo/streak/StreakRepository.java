package com.backend.demo.streak;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface StreakRepository extends JpaRepository<Streak, Long> {

    @Query("SELECT new com.backend.demo.streak.StreakDTO( " +
            " s.id, s.count, :memberId, s.timeStamp ) " +
            "FROM Streak s WHERE s.memberId.memberId = :memberId ORDER BY s.timeStamp DESC")
    Page<StreakDTO> getByMemberId(@Param("memberId") Long memberId, Pageable pageable);


}
