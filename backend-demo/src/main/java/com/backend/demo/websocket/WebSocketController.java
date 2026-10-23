package com.backend.demo.websocket;

import com.backend.demo.dto.*;
import com.backend.demo.postcomment.PostCommentRequest;
import com.backend.demo.postcomment.PostCommentService;
import com.backend.demo.text.TextService;
import com.backend.demo.textresponse.TextMessageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;


@Controller
@RequiredArgsConstructor
public class WebSocketController {

    private final TextService textService;
    private final TextMessageService textMessageService;
    private final WebSocketService webSocketService;
    private final PostCommentService commentService;

    @MessageMapping("/ws.addText")
    public void addText(
            @Payload @Valid CreateText textRequest,
            SimpMessageHeaderAccessor headerAccessor
    ) {
        Long spaceId = webSocketService.validateSpaceAuth(
                headerAccessor, textRequest.getMemberId()
        );
        textService.addText(textRequest, spaceId, headerAccessor.getSessionAttributes());
    }

    @MessageMapping("/tm.addTextMessage")
    public void addTextMessage(
            @Payload @Valid CreateTextMessage request,
            SimpMessageHeaderAccessor headerAccessor
    ) {
        Long spaceId = webSocketService.validateSpaceAuth(
                headerAccessor, request.getMemberId()
        );
        var user = webSocketService.getUserFromSession(headerAccessor.getSessionAttributes());
        textMessageService.addTextMessage(request, spaceId, user);
    }

    @MessageMapping("/post.addComment")
    public void addPostCommentOrReply(
            @Payload @Valid PostCommentRequest request,
            SimpMessageHeaderAccessor headerAccessor
    ) {
        Long spaceId = webSocketService.validateSpaceAuth(
                headerAccessor, request.getMemberId()
        );
        var user = webSocketService.getUserFromSession(headerAccessor.getSessionAttributes());
        commentService.addCommentOrReply(request, spaceId, user);
    }


    @MessageMapping("/post.deleteComment")
    public void deletePostComment(
            @Payload DeletePostCommentDTO postCommentDTO,
            SimpMessageHeaderAccessor headerAccessor
    ) {
        Long memberId = postCommentDTO.getMemberId();
        Long postId = postCommentDTO.getPostId();
        Long commentId = postCommentDTO.getCommentId();
        Long spaceId = webSocketService.validateSpaceAuth(
                headerAccessor, memberId
        );
        commentService.removePostComment(postId, memberId, spaceId, commentId);
    }

    @MessageMapping("/comment.deleteReply")
    public void deleteCommentReply(
            @Payload DeleteCommentReplyDTO commentReplyDTO,
            SimpMessageHeaderAccessor headerAccessor
    ) {
        Long memberId = commentReplyDTO.getMemberId();
        Long parentId = commentReplyDTO.getParentId();
        Long commentId = commentReplyDTO.getCommentId();
        Long spaceId = webSocketService.validateSpaceAuth(
                headerAccessor, memberId
        );
        commentService.deleteCommentReply(commentId, parentId, memberId, spaceId);
    }


    @MessageMapping("/tm.removeTextMessage")
    public void removeTextMessage(
            @Payload DeleteTextMessageDTO textMessageDTO,
            SimpMessageHeaderAccessor headerAccessor
    ) {
        Long memberId = textMessageDTO.getMemberId();
        Long textId = textMessageDTO.getTextId();
        Long messageId = textMessageDTO.getMessageId();

        Long spaceId = webSocketService.validateSpaceAuth(
                headerAccessor, memberId
        );
        textMessageService.removeTextMessage(textId, memberId, spaceId, messageId);
    }

    @MessageMapping("/text.removeText")
    public void removeText(
            @Payload DeleteTextDTO textDTO,
            SimpMessageHeaderAccessor headerAccessor
    ) {
        Long memberId = textDTO.getMemberId();
        Long textId = textDTO.getTextId();

        Long spaceId = webSocketService.validateSpaceAuth(
                headerAccessor, memberId
        );
        textService.deleteText(textId, memberId, spaceId);
    }

    @MessageMapping("/text.like")
    public void addLikeToText(
            @Payload TextReactionDTO textReactionDTO,
            SimpMessageHeaderAccessor headerAccessor
    ) {
        Long memberId = textReactionDTO.getMemberId();
        Long textId = textReactionDTO.getTextId();

        Long spaceId = webSocketService.validateSpaceAuth(headerAccessor, memberId);
        textService.likeToText(textId, memberId, spaceId);
    }

    @MessageMapping("/text.unLike")
    public void removeLikeToText(
            @Payload TextReactionDTO textReactionDTO,
            SimpMessageHeaderAccessor headerAccessor
    ) {
        Long memberId = textReactionDTO.getMemberId();
        Long textId = textReactionDTO.getTextId();

        Long spaceId = webSocketService.validateSpaceAuth(headerAccessor, memberId);
        textService.unlikeToText(textId, memberId, spaceId);
    }

}