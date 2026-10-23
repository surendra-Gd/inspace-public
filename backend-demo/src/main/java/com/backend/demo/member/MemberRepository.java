package com.backend.demo.member;


import com.backend.demo.projections.MemberInfoProjection;
import com.backend.demo.projections.SpaceCardProjection;
import com.backend.demo.projections.SpaceTokenProjection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;


import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface MemberRepository extends JpaRepository<SpaceMember, Long> {

    @Query("SELECT new com.backend.demo.projections.SpaceTokenProjection(m.memberId, m.space.spaceId) " +
            "FROM SpaceMember m WHERE m.member.userId = :userId AND m.memberStatus = 'ACTIVE' ")
    List<SpaceTokenProjection> getMembersByUserId(@Param("userId") Long userId);


    @Modifying
    @Query("UPDATE SpaceMember m SET m.memberStatus = :memberStatus WHERE m.memberId = :memberId")
    void updateMemberStatus(
            @Param("memberId") Long memberId, @Param("memberStatus") MemberStatus memberStatus
    );

    @Query("SELECT new com.backend.demo.projections.MemberInfoProjection(m.memberId, m.space.spaceId, m.joinedOn, m.memberType, " +
            "m.member.userId, m.member.username, m.member.name, m.member.profileUrl, m.member.status, m.totalStreak, " +
            "m.lastStreakModified, m.lastStreak) " +
            "FROM SpaceMember m WHERE m.memberId = :memberId AND m.memberStatus = 'ACTIVE'")
    Optional<MemberInfoProjection> getActiveMemberById(@Param("memberId") Long memberId);


    @Query("SELECT new com.backend.demo.projections.MemberInfoProjection(m.memberId, m.space.spaceId, m.joinedOn, m.memberType, " +
            "m.member.userId, m.member.username, m.member.name, m.member.profileUrl, m.member.status, m.totalStreak, " +
            "m.lastStreakModified, m.lastStreak) " +
            " FROM SpaceMember m WHERE m.space.spaceId = :spaceId " +
            "AND m.member.userId = :userId AND m.memberStatus = 'ACTIVE'")
    Optional<MemberInfoProjection> getMemberBySpaceIdAndUserId(@Param("spaceId") Long spaceId, @Param("userId") Long userId);


    @Query("SELECT m.memberId FROM SpaceMember m " +
            "WHERE m.space.spaceId = :spaceId AND m.member.userId = :userId")
    Optional<Long> getMemberIdByUserIdAndSpaceId(
            @Param("userId") Long userId, @Param("spaceId") Long spaceId
    );


    @Query("SELECT new com.backend.demo.projections.MemberInfoProjection(m.memberId, m.space.spaceId, m.joinedOn, m.memberType, " +
            "m.member.userId, m.member.username, m.member.name, m.member.profileUrl, m.member.status, m.totalStreak, " +
            "m.lastStreakModified, m.lastStreak) " +
            "FROM SpaceMember m WHERE m.space.spaceId = :spaceId AND m.memberStatus = 'ACTIVE' ")
    List<MemberInfoProjection> getMembersBySpaceId(Long spaceId);


    @Query("SELECT count(m) FROM SpaceMember m WHERE m.space.spaceId = :spaceId")
    Long countMembersById(Long spaceId);


    @Query("SELECT m.memberId FROM SpaceMember m " +
            "WHERE m.space.spaceId = :spaceId AND m.memberStatus = 'REMOVED'")
    List<Long> getRemovedMembers(Long spaceId);


    @Query("SELECT CASE WHEN COUNT(m) > 0 THEN true ELSE false END FROM SpaceMember m " +
            "WHERE m.memberId= :memberId AND m.space.spaceId = :spaceId AND m.memberStatus = 'ACTIVE'")
    boolean existsByMemberIdAndSpaceId(Long memberId, Long spaceId);

    @Query("SELECT m.memberId FROM SpaceMember m WHERE m.member.userId = :userId " +
            "AND m.space.spaceId = :spaceId AND m.memberStatus = 'ACTIVE' ")
    Optional<Long> getMemberIdByUserAndSpace(Long userId, Long spaceId);

    @Query("SELECT m FROM SpaceMember m " +
            "WHERE m.memberId = :memberId AND m.memberStatus = 'ACTIVE' ")
    Optional<SpaceMember> getSpaceMemberByMemberId(Long memberId);

    @Query("SELECT new com.backend.demo.projections.SpaceCardProjection(" +
            "m.space.spaceId, m.space.spacename, m.space.uniqueId, m.space.admin.userId ) " +
            "FROM SpaceMember m WHERE m.member.userId = :userId " +
            "AND m.memberStatus = 'ACTIVE'")
    List<SpaceCardProjection> getSpacesByUserId(@Param("userId") Long userId);

    @Transactional
    void deleteSpaceMemberByMemberId(Long memberId);

//    @Modifying
//    @Transactional
//    @Query("UPDATE SpaceMember m SET m.totalStreak = m.totalStreak + :streak, " +
//            "m.lastStreakModified = :now, m.lastStreak = :streak " +
//            "WHERE m.memberId = :memberId AND " +
//            "(m.lastStreakModified IS NULL OR m.lastStreakModified <> :now)")
//    void updateStreakCount(
//            @Param("memberId") Long memberId, @Param("now") LocalDate now,
//            @Param("streak") int streak
//    );

//    @Query("SELECT CASE WHEN COUNT(m) > 0 THEN true ELSE false END " +
//            "FROM SpaceMember m WHERE m.memberId = :memberId AND m.lastStreakModified = :today")
//    boolean hasStreakUpdatedToday(
//            @Param("memberId") Long memberId, @Param("today") LocalDate today
//    );


    @Query("SELECT sm.space.spaceId FROM SpaceMember sm " +
            "WHERE sm.member.userId=:userId AND sm.memberStatus = 'ACTIVE'")
    List<Long> getSpaceIdsByUser(@Param("userId") Long userId);

}