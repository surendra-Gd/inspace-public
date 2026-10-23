package com.backend.demo.textresponse;

import com.backend.demo.common.PageResponse;
import com.backend.demo.dto.*;
import com.backend.demo.exception.DatabaseOperationException;
import com.backend.demo.exception.OperationFailedException;
import com.backend.demo.exception.ResourceNotFoundException;
import com.backend.demo.text.Text;
import com.backend.demo.text.TextRepository;
import com.backend.demo.redis.RedisService;
import com.backend.demo.payload.PayloadMapper;
import com.backend.demo.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class TextMessageServiceImpl implements TextMessageService {


    private final TextRepository textRepository;
    private final TextMessageRepository textMessageRepository;
    private final DTOMapper mapper;
    private final RedisService redisService;
    private final PayloadMapper payloadMapper;

    @Override
    public void addTextMessage(CreateTextMessage request, Long spaceId, User user) {
        Text text = textRepository.findById(request.getTextId())
                .orElseThrow(() -> new OperationFailedException(
                        "Can’t find the text! Double-check and try again. ✨"
                ));

        TextMessage textMessage = mapper.mapToTextMessage(request, spaceId, text);
        TextMessage savedTextMessage;
        try {
            savedTextMessage = textMessageRepository.save(textMessage);
            textRepository.addMessageCountToText(text.getTextId(), LocalDateTime.now());
        } catch (RuntimeException e) {
            System.out.println(e.getMessage());
            throw new DatabaseOperationException(
                    "Oops! Couldn’t save your text message. Try again! \uD83D\uDE0A.",
                    "save"
            );
        }
        var payload = payloadMapper.mapToTextMessagePayload(savedTextMessage, text.getText(), user.getProfileUrl());
        redisService.publishMessage(
                String.format("/sub/space/%s", spaceId), payload
        );
    }

    @Transactional
    @Override
    public void removeTextMessage(Long textId, Long memberId, Long spaceId, Long messageId) {
        boolean isExists = textMessageRepository.existsByIdAndMember(messageId, memberId);
        if (isExists) {
            try {
                textMessageRepository.deleteById(messageId);
                textRepository.removeMessageCountFromText(textId, LocalDateTime.now());
            } catch (Exception e) {
                System.out.println(e.getMessage());
                throw new DatabaseOperationException(
                        "Oops! We couldn't delete that message", ""
                );
            }
        };
        var payload = payloadMapper.mapToRemoveTextMessagePayload(memberId, textId, messageId);
        redisService.publishMessage(
                String.format("/sub/space/%s", spaceId), payload
        );
    }

    @Override
    public ResponseEntity<?> getTextMessages(Long textId, int page, Long spaceId) {
        boolean isTextExists = textRepository.existsByIdAndSpaceId(textId, spaceId);
        if (!isTextExists) throw new ResourceNotFoundException("Text is not found");
        Pageable pageable = PageRequest.of(page, 100);
        Page<TextMessageDTO> textMessages = textMessageRepository.getPageTextMessageByTextId(textId, pageable);
        var response = new PageResponse<>(
                textMessages.getContent(),
                textMessages.getNumber(),
                textMessages.getTotalElements(),
                textMessages.getTotalPages(),
                textMessages.isFirst(),
                textMessages.isLast(),
                textMessages.hasNext(),
                textMessages.hasPrevious()
        );
        return ResponseEntity.ok(response);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    @Override
    public void removeAllByMember(Long memberId) {
        try {
            textMessageRepository.deleteTextMessagesByMemberId(memberId);
        } catch (Exception e) {
            throw new DatabaseOperationException(e.getMessage(),
                    "There is an error occurred in removeAllByMember in TextMessageService by delete " +
                            "-P %s".formatted(memberId)
            );
        }
    }
}