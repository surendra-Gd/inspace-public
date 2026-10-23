package com.backend.demo.post;

import com.backend.demo.projections.PostDeleteProjection;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {

    Optional<Post> findPostByPostId(Long imageId);

    @Query("SELECT p FROM Post p LEFT JOIN FETCH p.emojis WHERE p.memberId = :memberId")
    Page<Post> getPostsByMemberId(Long memberId, Pageable pageable);


    @Query("SELECT COUNT(*) FROM Post p WHERE p.memberId = :memberId " +
            "AND p.sharedOn >= :startOfDay AND p.sharedOn < :endOfDay")
    Long countPostsByUserIdAndTimeRange(@Param("memberId") Long memberId,
            @Param("startOfDay") LocalDateTime startOfDay,
            @Param("endOfDay") LocalDateTime endOfDay
    );


    // Todo: This retrieving emojis also avoid it.
    @Query("SELECT p FROM Post p WHERE p.spaceId = :spaceId AND p.sharedOn >= :startOfDay" +
            " AND p.sharedOn < :endOfDay ORDER BY p.sharedOn DESC ")
    List<Post> getTodayPostsBySpaceId(@Param("spaceId") Long spaceId,
            @Param("startOfDay") LocalDateTime startOfDay,
            @Param("endOfDay") LocalDateTime endOfDay
    );

    List<PostDeleteProjection> getPostsBySpaceId(Long spaceId);
    List<PostDeleteProjection> getPostsByMemberId(Long memberId);
    Optional<PostDeleteProjection> findByPostId(Long postId);

    @Transactional
    void deletePostsBySpaceId(Long spaceId);

    @Transactional
    void deletePostByPostId(Long postId);

    @Transactional
    void deletePostsByMemberId(Long memberId);

    boolean existsByImageKey(String key);

    boolean existsByPostId(Long postId);

    boolean existsByPostIdAndSpaceId(Long postId, Long spaceId);

}