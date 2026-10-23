package com.backend.demo.emoji;

import com.backend.demo.dto.EmojiDTO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmojiRepository extends JpaRepository<Emoji, Long> {

    @Modifying
    @Transactional
    @Query("DELETE FROM Emoji e WHERE e.id = :id")
    void deleteEmojiById(@Param("id") Long id);

    @Modifying
    @Transactional
    @Query("DELETE FROM Emoji e WHERE e.memberId = :memberId")
    void deleteAllByMemberId(@Param("memberId") Long memberId);

    @Query("SELECT new com.backend.demo.dto.EmojiDTO(e.id, e.emojis, e.memberId, e.post.postId) " +
            "FROM Emoji e WHERE e.post.postId = :postId AND e.memberId = :memberId")
    Optional<EmojiDTO> getEmojiByMappingIds(
            @Param("postId") Long postId, @Param("memberId") Long memberId
    );

    @Query("SELECT new com.backend.demo.dto.EmojiDTO(e.id, e.emojis, e.memberId, e.post.postId) " +
            "FROM Emoji e WHERE e.post.postId = :postId")
    List<EmojiDTO> getPostEmojisByPostId(@Param("postId") Long postId);

    @Query("SELECT e.memberId FROM Emoji e WHERE e.id = :emojiId")
    Optional<Long> getEmojiMemberById(@Param("emojiId") Long emojiId);
}