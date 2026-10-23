package com.backend.demo.textresponse;

import com.backend.demo.dto.TextMessageDTO;
import com.backend.demo.dto.UnSeenMessagesDTO;
import com.backend.demo.text.Text;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

public interface TextMessageRepository extends JpaRepository<TextMessage, Long> {


    @Query("SELECT COUNT(tm) > 0 FROM TextMessage tm " +
            "WHERE tm.memberId = :memberId AND tm.id = :messageId")
    boolean existsByIdAndMember(
            @Param("messageId") Long messageId, @Param("memberId") Long memberId
    );


    @Query("SELECT new com.backend.demo.dto.TextMessageDTO( " +
            "tm.id, tm.message, tm.timeStamp, tm.type, tm.prefixes, " +
            "tm.text.textId, tm.memberId, tm.spaceId " +
            ") FROM TextMessage tm " +
            "WHERE tm.text.textId = :textId ORDER BY tm.timeStamp DESC")
    Page<TextMessageDTO> getPageTextMessageByTextId(
            @Param("textId") Long textId, Pageable pageable
    );

    @Transactional
    @Modifying
    void deleteTextMessagesByMemberId(Long memberId);
}
