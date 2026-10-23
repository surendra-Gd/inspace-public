package com.backend.demo.streak;

import com.backend.demo.common.PageResponse;
import com.backend.demo.exception.AccessDeniedException;
import com.backend.demo.member.MemberRepository;
import com.backend.demo.member.MemberService;
import com.backend.demo.member.SpaceMember;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class StreakServiceImpl implements StreakService{

    private final StreakRepository streakRepository;
    private final MemberService memberService;
    private final MemberRepository memberRepository;

    @Override
    public ResponseEntity<?> getStreaksByMemberId(Long memberId, int page, Long spaceId) {
        var isExists = memberService.existsByMember(memberId, spaceId);
        if (!isExists) {
            throw new AccessDeniedException("Access Denied! You don't get this streaks.");
        }
        Pageable pageable = PageRequest.of(page, 100);
        Page<StreakDTO> streaks = streakRepository.getByMemberId(memberId, pageable);
        List<StreakDTO> streakList = streaks.getContent();
        Map<String, Object> response = new HashMap<>();
        var pageResponse = new PageResponse<>(
                streakList,
                streaks.getNumber(),
                streaks.getTotalElements(),
                streaks.getTotalPages(),
                streaks.isFirst(),
                streaks.isLast(),
                streaks.hasNext(),
                streaks.hasPrevious()
        );
        response.put("response", pageResponse);
        response.put("pageLastId",
                streakList.isEmpty() ? null : streakList.get(streakList.size() - 1).getId()
        );
        response.put("pageLastDate",
                streakList.isEmpty() ? null : streakList.get(streakList.size() - 1).getTimeStamp()
        );
        return ResponseEntity.ok(response);
    }

    public int generateRandomStreak(int len) {
        SecureRandom secureRandom = new SecureRandom();
        return secureRandom.nextInt(len) + 1;
    }


    @Transactional
    @Modifying
    @Override
    public int addTodayStreak(int len, Long memberId) {
        LocalDate todayDate = LocalDate.now();
        SpaceMember member = memberService.getByMemberId(memberId);


        if (member.getLastStreakModified().isEqual(todayDate)) return 0;

        int count = generateRandomStreak(len);
        var streak = Streak.builder()
                .timeStamp(todayDate).count(count).memberId(member)
                .build();
        streakRepository.save(streak);

        member.setLastStreak(count);
        member.setTotalStreak(member.getTotalStreak() + count);
        member.setLastStreakModified(todayDate);
        memberRepository.save(member);

        return count;
    }

}