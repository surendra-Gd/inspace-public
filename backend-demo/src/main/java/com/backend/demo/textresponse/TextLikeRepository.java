package com.backend.demo.textresponse;

import com.backend.demo.text.Text;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;


public interface TextLikeRepository extends JpaRepository<TextLike, Long> {

    @Query("SELECT l.likeId FROM TextLike l WHERE l.text.textId = :textId AND l.memberId = :memberId")
    Optional<Long> findLikeByTextAndMember(
            @Param("textId") Long textId, @Param("memberId") Long memberId
    );

    @Query("SELECT COUNT(l) > 0 FROM TextLike l WHERE l.text.textId = :textId AND l.memberId = :memberId")
    boolean existsByTextAndMember(@Param("textId") Long textId, @Param("memberId") Long memberId);

    Long text(Text text);
}
