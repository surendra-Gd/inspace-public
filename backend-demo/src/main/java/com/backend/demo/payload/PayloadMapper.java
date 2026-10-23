package com.backend.demo.payload;

import com.backend.demo.dto.DTOMapper;
import com.backend.demo.text.Text;
import com.backend.demo.textresponse.TextMessage;
import com.backend.demo.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;


@Service
@RequiredArgsConstructor
public class PayloadMapper {

    private final DTOMapper mapper;


    public TextPayload mapToTextPayload(
            Text text, int streak, User user
    ) {
        var textDto = mapper.mapToTextDTO(text, false);
        return TextPayload.builder()
                .action(Action.WS_ADD_TEXT)
                .payload(textDto)
                .streak(streak)
                .userName(user.getUsername())
                .profile(user.getProfileUrl())
                .userId(user.getUserId())
                .build();
    }

    public TextMessagePayload mapToTextMessagePayload(TextMessage textMessage, String text, String profile) {
        var textMessageDto = mapper.mapToTextMessageDTO(textMessage);
        return TextMessagePayload.builder()
                .action(Action.WS_ADD_TEXT_MESSAGE)
                .text(text)
                .profile(profile)
                .payload(textMessageDto)
                .build();
    }


    public RemoveTextMessagePayload mapToRemoveTextMessagePayload(
            Long memberId, Long textId, Long messageId
    ) {
        return RemoveTextMessagePayload.builder()
                .action(Action.WS_REMOVE_TEXT_MESSAGE)
                .messageId(messageId)
                .textId(textId)
                .memberId(memberId)
                .build();
    }

    public RemovePostCommentPayload mapToRemovePostCommentPayload(
            Long memberId, Long postId, Long commentId
    ) {
        return RemovePostCommentPayload.builder()
                .action(Action.WS_REMOVE_POST_COMMENT)
                .commentId(commentId)
                .postId(postId)
                .memberId(memberId)
                .build();
    }

    public RemovePostCommentPayload mapToRemoveCommentReplyPayload(
            Long memberId, Long postId, Long commentId
    ) {
        return RemovePostCommentPayload.builder()
                .action(Action.WS_REMOVE_COMMENT_REPLY)
                .commentId(commentId)
                .postId(postId)
                .memberId(memberId)
                .build();
    }



    public UserStatusPayload mapToUserStatusPayload(
            UserStatus status, Long userId, String profileUrl, String username
    ) {
        return UserStatusPayload.builder()
                .status(status)
                .userId(userId)
                .action(Action.WS_USER_STATUS_UPDATE)
                .profileUrl(profileUrl)
                .username(username)
                .build();
    }

    public SpaceChannels mapToSpaceChannels(List<String> channels) {
        return SpaceChannels.builder()
                .action(Action.WS_SPACE_CHANNELS_UPDATE)
                .channels(channels)
                .build();
    }

    public TextLikePayload mapToTextLikePayload(
            Long textId, Long memberId, Long spaceId
    ) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("memberId", memberId);
        payload.put("spaceId", spaceId);
        payload.put("textId", textId);

        return TextLikePayload.builder()
                .action(Action.WS_LIKE_TEXT)
                .payload(payload)
                .build();
    }

    public TextUnLikePayload mapToTextUnLikePayload(
            Long textId, Long memberId, Long spaceId
    ) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("memberId", memberId);
        payload.put("spaceId", spaceId);
        payload.put("textId", textId);

        return TextUnLikePayload.builder()
                .action(Action.WS_UNLIKE_TEXT)
                .payload(payload)
                .build();
    }
}