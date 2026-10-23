package com.backend.demo.postcomment;

import com.backend.demo.dto.PostCommentDTO;
import com.backend.demo.dto.PostCommentResponse;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Optional;


public interface PostCommentRepository extends JpaRepository<PostComment, Long> {

    @Query("SELECT new com.backend.demo.dto.PostCommentResponse( " +
            "c.commentId, c.payload, c.commentedOn, c.lastUpdatedOn, " +
            "c.post.postId, c.memberId, c.spaceId, c.replyCount) FROM PostComment c " +
            "WHERE c.post.postId = :postId AND c.commentType = 'COMMENT' AND c.parentComment IS NULL " +
            "ORDER BY c.commentedOn DESC")
    Page<PostCommentResponse> getPostCommentByPostId(
            @Param("postId") Long postId, Pageable pageable
    );


    @Modifying
    @Query("UPDATE PostComment c " +
            "SET c.replyCount = CASE WHEN c.replyCount > 0 THEN c.replyCount - 1 ELSE 0 END " +
            "WHERE c.commentId = :commentId")
    void removeReplyCount(@Param("commentId") Long commentId);


    @Modifying
    @Transactional
    @Query("UPDATE PostComment c SET c.replyCount=c.replyCount+1, c.lastUpdatedOn = :now " +
            "WHERE c.commentId=:commentId")
    void updateReplyCount(@Param("commentId") Long commentId, @Param("now")LocalDateTime time);


    @Query("SELECT COUNT(c) > 0 FROM PostComment c WHERE " +
            "c.memberId = :memberId AND c.commentId = :commentId")
    boolean existsByIdAndMember(
            @Param("commentId") Long commentId,
            @Param("memberId") Long memberId
    );


    @Query("SELECT c FROM PostComment c WHERE c.commentId = :commentId")
    Optional<PostComment> findByCommentId(@Param("commentId") Long commentId);

    @Query("SELECT COUNT(c) > 0 FROM PostComment c " +
            "WHERE c.commentId=:commentId AND c.spaceId=:spaceId")
    boolean existsByCommentAndSpaceId(
            @Param("commentId") Long commentId, @Param("spaceId") Long spaceId
    );


    @Query("SELECT new com.backend.demo.dto.PostCommentDTO( " +
            "r.commentId, r.payload, r.parentComment.commentId, r.commentedOn, r.prefixes, " +
            "r.post.postId, r.memberId, r.spaceId, r.lastUpdatedOn) FROM PostComment r WHERE " +
            "r.parentComment.commentId = :parentCommentId AND r.commentType = 'REPLY' " +
            "ORDER BY r.commentedOn DESC")
    Page<PostCommentDTO> getRepliesByCommentId(
            @Param("parentCommentId") Long parentCommentId, Pageable pageable
    );

    @Transactional
    @Modifying
    void deleteAllByMemberId(Long memberId);
}