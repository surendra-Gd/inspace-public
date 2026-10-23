package com.backend.demo.textresponse;

import com.backend.demo.dto.CreateTextMessage;
import com.backend.demo.user.User;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

public interface TextMessageService {
    void addTextMessage(CreateTextMessage request, Long spaceId, User user);

    @Transactional
    void removeTextMessage(Long textId, Long memberId, Long spaceId, Long messageId);

    ResponseEntity<?> getTextMessages(Long textId, int page, Long spaceId);

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    void removeAllByMember(Long memberId);
}
