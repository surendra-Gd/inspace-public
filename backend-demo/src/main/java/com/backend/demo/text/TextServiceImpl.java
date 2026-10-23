package com.backend.demo.text;

import com.backend.demo.common.PageResponse;
import com.backend.demo.dto.CreateText;
import com.backend.demo.dto.TextDTO;
import com.backend.demo.exception.DatabaseOperationException;
import com.backend.demo.exception.OperationFailedException;
import com.backend.demo.exception.ResourceFoundException;
import com.backend.demo.exception.ResourceNotFoundException;
import com.backend.demo.notification.NotificationService;
import com.backend.demo.payload.Action;
import com.backend.demo.redis.RedisService;
import com.backend.demo.payload.PayloadMapper;
import com.backend.demo.payload.DeleteTextPayload;
import com.backend.demo.streak.StreakService;
import com.backend.demo.textresponse.TextLike;
import com.backend.demo.textresponse.TextLikeRepository;
import com.backend.demo.user.User;
import com.backend.demo.websocket.WebSocketService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
public class TextServiceImpl implements TextService {

    private final TextRepository textRepository;
    private final RedisService redisService;
    private final PayloadMapper payloadMapper;
    private final TextLikeRepository likeRepository;
    private final NotificationService notificationService;
    private final WebSocketService webSocketService;
    private final StreakService streakService;


    @Transactional
    @Override
    public void addText(
            CreateText textDTO, Long spaceId, Map<String, Object> sessionAttributes
    ) {
        Text savedText = saveTextToDatabase(textDTO, spaceId);
        int streak;
        try {
            streak = streakService.addTodayStreak(9, textDTO.getMemberId());
        } catch (Exception e) {
            System.out.println(e.getMessage());
            throw new OperationFailedException(
                    "Oops! Couldn’t save your text. Try again! \uD83D\uDE0A."
            );
        }

        User user = webSocketService.getUserFromSession(sessionAttributes);
        var payload = payloadMapper.mapToTextPayload(savedText, streak, user);
        redisService.publishMessage(
                String.format("/sub/space/%s", spaceId), payload
        );

        // Notification 🚩
        notificationService.notificationOnNewText(
                spaceId, savedText.getTextId(), textDTO.getMemberId(), user, streak
        );
    }

    private Text saveTextToDatabase(CreateText textDTO, Long spaceId) {
        try {

            String taggedAsString = !textDTO.getTagged().isEmpty()
                    ? textDTO.getTagged().stream()
                    .map(String::valueOf)
                    .collect(Collectors.joining(","))
                    : null;

            return textRepository.save(
                    Text.builder()
                            .text(textDTO.getText())
                            .spaceId(spaceId)
                            .memberId(textDTO.getMemberId())
                            .createdOn(LocalDateTime.now())
                            .isAnonymous(textDTO.isAnonymous())
                            .likesCount(0L)
                            .messagesCount(0L)
                            .tagged(taggedAsString)
                            .lastUpdatedOn(LocalDateTime.now())
                            .build()
            );
        } catch (Exception e) {
            throw new DatabaseOperationException(
                    "Oops! Couldn’t save your text. Try again! \uD83D\uDE0A.", "save"
            );
        }
    }


    @Modifying
    @Transactional
    @Override
    public void deleteText(Long textId, Long memberId, Long spaceId) {
        boolean isExists = textRepository.isTextExists(textId, memberId);
        if(isExists) {
            try {
                textRepository.deleteById(textId);
            } catch (Exception e) {
                System.out.println(e.getMessage());
                throw new DatabaseOperationException("Oops! We couldn't delete the text", "");
            }
        }
        var payload = new DeleteTextPayload(Action.WS_DELETE_TEXT, memberId, textId, spaceId);
        redisService.publishMessage(
                String.format("/sub/space/%s", spaceId), payload
        );
    }

    @Transactional
    @Override
    public void likeToText(Long textId, Long memberId, Long spaceId) {
        boolean likeIsExists = likeRepository.existsByTextAndMember(textId, memberId);
        if(likeIsExists) throw new ResourceFoundException("You've already hit the like button on this!");

        Text text = textRepository.findById(textId)
                .orElseThrow(() -> new ResourceNotFoundException("Uh-oh! That text is missing!"));

        if(!text.getSpaceId().equals(spaceId))
            throw new OperationFailedException("You're not allowed to like this one.");

        TextLike like = TextLike.builder()
                .text(text)
                .memberId(memberId)
                .spaceId(spaceId)
                .build();

        try {
            likeRepository.save(like);
            textRepository.addLikeToText(textId);
        } catch (Exception e) {
            System.out.println(e.getMessage());
            throw new DatabaseOperationException("We couldn't add your like. Try again!", "");
        }

        var payload = payloadMapper.mapToTextLikePayload(
                textId, memberId, spaceId
        );
        redisService.publishMessage(
                String.format("/sub/space/%s", spaceId), payload
        );
    }

    @Transactional
    @Override
    public void unlikeToText(Long textId, Long memberId, Long spaceId) {
        Long likeId = likeRepository.findLikeByTextAndMember(textId, memberId)
                .orElse(null);

        if(likeId != null) {
            try {
                likeRepository.deleteById(likeId);
                textRepository.removeLikeFromText(textId);
            } catch (Exception e) {
                System.out.println(e.getMessage());
                throw new DatabaseOperationException("We couldn't remove your like. Try again!", "");
            }
        }

        var payload = payloadMapper.mapToTextUnLikePayload(
                textId, memberId, spaceId
        );
        redisService.publishMessage(
                String.format("/sub/space/%s", spaceId), payload
        );
    }

    @Override
    public ResponseEntity<?> getTexts(Long spaceId, int page, Long memberId) {
        Pageable pageable = PageRequest.of(page, 10);
        Page<TextDTO> texts = textRepository.findTextsBySpaceIdWithLikeStatus(spaceId, memberId, pageable);
        var response = new PageResponse<>(
                texts.getContent(),
                texts.getNumber(),
                texts.getTotalElements(),
                texts.getTotalPages(),
                texts.isFirst(),
                texts.isLast(),
                texts.hasNext(),
                texts.hasPrevious()
        );
        return ResponseEntity.ok(response);
    }

    @Override
    public ResponseEntity<?> getTextById(Long textId, Long spaceId, Long memberId) {
        System.out.println("textId: " + textId + " spaceId: " + spaceId + " | memberId: "+ memberId);
        TextDTO textDTO = textRepository.getTextByIdAndSpaceId(textId, spaceId, memberId)
                .orElseThrow(() -> new EntityNotFoundException("Text is not found"));
        return ResponseEntity.ok(textDTO);
    }


    @Transactional(propagation = Propagation.REQUIRES_NEW)
    @Override
    public void deleteTextsBySpace(Long spaceId) {
        try {
            textRepository.deleteTextsBySpaceId(spaceId);
        } catch (Exception e) {
            throw new DatabaseOperationException(e.getMessage(),
                    "There is an error occurred in deleteTextsBySpace in TextService by delete " +
                            "-P %s".formatted(spaceId)
            );
        }
    }


    @Transactional(propagation = Propagation.REQUIRES_NEW)
    @Override
    public void removeTextsByMember(Long memberId) {
        try {
            textRepository.deleteTextsByMemberId(memberId);
        } catch (Exception e) {
            throw new DatabaseOperationException(e.getMessage(),
                    "There is an error occurred in removeTextsByMember in TextService by delete " +
                            "-P %s".formatted(memberId)
            );
        }
    }
}