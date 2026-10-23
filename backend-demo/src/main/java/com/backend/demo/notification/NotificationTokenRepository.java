package com.backend.demo.notification;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface NotificationTokenRepository extends JpaRepository<NotificationToken, Long> {

    Optional<NotificationToken> findByUserId(Long userId);


    @Query("SELECT t.deviceToken FROM SpaceMember m " +
            "INNER JOIN NotificationToken t ON m.member.userId = t.userId " +
            "WHERE m.space.spaceId = :spaceId " +
            "AND m.memberStatus = 'ACTIVE' AND m.member.userId != :userId AND t.isExpired = false")
    List<String> getMemberDeviceTokens(
            @Param("spaceId") Long spaceId, @Param("userId") Long userId
    );


    @Query("SELECT t.deviceToken FROM NotificationToken t " +
            "WHERE t.userId = :targetUserId AND t.isExpired = false")
    Optional<String> getDeviceTokenByUserId(@Param("targetUserId") Long targetUserId);


    @Modifying
    @Transactional
    @Query("UPDATE NotificationToken t SET t.isExpired = true, t.lastUpdatedAt = :now " +
            "WHERE t.deviceToken = :token AND t.isExpired = false ")
    void flagTokensAsExpired(@Param("token") String token, @Param("now") LocalDateTime time);
}
