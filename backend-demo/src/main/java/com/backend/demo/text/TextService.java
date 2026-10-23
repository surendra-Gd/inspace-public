package com.backend.demo.text;

import com.backend.demo.dto.CreateText;
import jakarta.validation.Valid;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

public interface TextService {

    @Transactional
    void addText(
            CreateText textDTO, Long spaceId, Map<String, Object> sessionAttributes
    );

    @Modifying
    @Transactional
    void deleteText(Long textId, Long memberId, Long spaceId);

    @Transactional
    void likeToText(Long textId, Long memberId, Long spaceId);

    @Transactional
    void unlikeToText(Long textId, Long memberId, Long spaceId);

    ResponseEntity<?> getTexts(Long spaceId, int page, Long memberId);

    ResponseEntity<?> getTextById(Long textId, Long spaceId, Long memberId);

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    void deleteTextsBySpace(Long spaceId);

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    void removeTextsByMember(Long memberId);
}
