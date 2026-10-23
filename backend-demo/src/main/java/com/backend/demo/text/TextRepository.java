package com.backend.demo.text;

import com.backend.demo.dto.TextDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;


import java.time.LocalDateTime;
import java.util.Optional;

public interface TextRepository extends JpaRepository<Text, Long> {


    @Query("SELECT COUNT(t) > 0 FROM Text t WHERE t.memberId = :memberId AND t.createdOn >= :startOfDay")
    boolean hasTextToday(@Param("memberId") Long memberId, @Param("startOfDay") LocalDateTime startOfDay);

    @Query("SELECT t FROM Text t WHERE t.spaceId = :spaceId AND t.createdOn >= :startOfDay AND t.createdOn < :endOfDay ORDER BY t.messagesCount DESC")
    Page<Text> getTodayTexts(@Param("spaceId") Long spaceId, Pageable pageable,
                             @Param("startOfDay") LocalDateTime startOfDay, @Param("endOfDay") LocalDateTime endOfDay);

    @Query("SELECT COUNT(t) > 0 FROM Text t WHERE t.memberId = :memberId AND t.textId = :textId")
    boolean isTextExists(@Param("textId") Long textId, @Param("memberId") Long memberId);

    @Query("SELECT t FROM Text t WHERE t.memberId = :memberId AND t.textId = :textId")
    Optional<Text> findByIdAndMember(
            @Param("textId") Long textId, @Param("memberId") Long memberId
    );

    @Query("SELECT t FROM Text t WHERE t.spaceId = :spaceId ORDER BY t.createdOn DESC")
    Page<Text> findAllBySpaceId(@Param("spaceId") Long spaceId, Pageable pageable);

    @Modifying
    @Query("UPDATE Text t SET t.likesCount=t.likesCount-1 WHERE t.textId=:textId")
    void removeLikeFromText(@Param("textId") Long textId);

    @Modifying
    @Query("UPDATE Text t SET t.likesCount=t.likesCount+1 WHERE t.textId=:textId")
    void addLikeToText(@Param("textId") Long textId);

    @Modifying
    @Transactional
    @Query("UPDATE Text t SET t.messagesCount=t.messagesCount+1," +
            " t.lastUpdatedOn=:lastUpdatedOn WHERE t.textId=:textId")
    void addMessageCountToText(@Param("textId") Long textId, @Param("lastUpdatedOn") LocalDateTime lastUpdatedOn);

    @Modifying
    @Transactional
    @Query("UPDATE Text t SET t.messagesCount=t.messagesCount-1," +
            " t.lastUpdatedOn=:lastUpdatedOn WHERE t.textId=:textId")
    void removeMessageCountFromText(@Param("textId") Long textId, @Param("lastUpdatedOn") LocalDateTime lastUpdatedOn);


    @Query("SELECT new com.backend.demo.dto.TextDTO(" +
            "t.textId, t.text, t.memberId, " +
            "t.tagged, " +
            "t.spaceId, t.createdOn, t.isAnonymous, t.messagesCount, t.likesCount, t.lastUpdatedOn, " +
            "CASE WHEN tl.likeId IS NOT NULL THEN TRUE ELSE FALSE END) " +
            "FROM Text t " +
            "LEFT JOIN t.likes tl ON t.textId = tl.text.textId AND tl.memberId = :memberId " +
            "WHERE t.spaceId = :spaceId " +
            "ORDER BY t.lastUpdatedOn DESC")
    Page<TextDTO> findTextsBySpaceIdWithLikeStatus(
            @Param("spaceId") Long spaceId,
            @Param("memberId") Long memberId,
            Pageable pageable);

    @Query("SELECT new com.backend.demo.dto.TextDTO( " +
            "t.textId, t.text, t.memberId," +
            "t.tagged, " +
            "t.spaceId, t.createdOn, t.isAnonymous, t.messagesCount, t.likesCount, t.lastUpdatedOn, " +
            "CASE WHEN tl.likeId IS NOT NULL THEN TRUE ELSE FALSE END) " +
            "FROM Text t " +
            "LEFT JOIN t.likes tl ON t.textId = tl.text.textId AND tl.memberId = :memberId " +
            "WHERE t.spaceId = :spaceId AND t.textId = :textId")
    Optional<TextDTO> getTextByIdAndSpaceId(
            @Param("textId") Long textId, @Param("spaceId") Long spaceId,
            @Param("memberId") Long memberId
    );

    @Query("SELECT COUNT(t) > 0 FROM Text t " +
            "WHERE t.spaceId = :spaceId AND t.textId = :textId")
    boolean existsByIdAndSpaceId(
            @Param("textId") Long textId, @Param("spaceId") Long spaceId
    );


    @Transactional
    @Modifying
    void deleteTextsBySpaceId(Long spaceId);

    void deleteTextsByMemberId(Long memberId);
}