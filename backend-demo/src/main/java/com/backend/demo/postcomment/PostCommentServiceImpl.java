package com.backend.demo.postcomment;


import com.backend.demo.common.PageResponse;
import com.backend.demo.dto.DTOMapper;
import com.backend.demo.dto.PostCommentDTO;
import com.backend.demo.dto.PostCommentResponse;
import com.backend.demo.exception.*;
import com.backend.demo.payload.Action;
import com.backend.demo.payload.PayloadMapper;
import com.backend.demo.post.Post;
import com.backend.demo.post.PostService;
import com.backend.demo.redis.RedisService;
import com.backend.demo.user.User;
import jakarta.persistence.*;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class PostCommentServiceImpl implements PostCommentService {

    private final PostService postService;
    private final PostCommentRepository postCommentRepository;
    private final PayloadMapper payloadMapper;
    private final RedisService redisService;
    private final DTOMapper mapper;

    public PostCommentServiceImpl(
            @Lazy PostService postService,
            PostCommentRepository postCommentRepository,
            PayloadMapper payloadMapper,
            RedisService redisService,
            DTOMapper mapper
    ) {
        this.postService = postService;
        this.postCommentRepository = postCommentRepository;
        this.payloadMapper = payloadMapper;
        this.redisService = redisService;
        this.mapper = mapper;
    }


    @Override
    public void addCommentOrReply(
            PostCommentRequest commentDTO, Long spaceId, User user
    ) {
        var post = postService.getPostByPostId(commentDTO.getPostId());
        if (!post.getSpaceId().equals(spaceId)) {
            throw new OperationFailedException(
                    "Oops! You're not allowed to comment on this post."
            );
        }
        Map<String, Object> payload = new HashMap<>();
        var type = commentDTO.getCommentType();

        switch (type) {
            case COMMENT -> {
                PostCommentResponse mappedComment = addPostComment(commentDTO, spaceId, post);

                payload.put("action", Action.WS_ADD_POST_COMMENT);
                payload.put("payload", mappedComment);
                payload.put("profile", user.getProfileUrl());
                payload.put("username", user.getUsername());
                payload.put("post", post.getUrl());

                redisService.publishMessage(
                        String.format("/sub/space/%s", spaceId), payload
                );
            }
            case REPLY -> {
                PostComment reply =  addReplyToComment(commentDTO, spaceId, post);
                PostCommentDTO mappedReply = mapper.mapToPostCommentDTO(reply);

                payload.put("action", Action.WS_ADD_COMMENT_REPLY);
                payload.put("payload", mappedReply);
                payload.put("profile", user.getProfileUrl());
                payload.put("username", user.getUsername());
                payload.put("comment", reply.getParentComment().getPayload());
                redisService.publishMessage(
                        String.format("/sub/space/%s", spaceId), payload
                );
            }
            default -> throw new InvalidCredentialsException("Invalid Comment Type. Please recheck again!");
        }
    }

    private PostCommentResponse addPostComment(
            PostCommentRequest commentDTO,
            Long spaceId, Post post
    ) {
        var postComment = createPostComment(
                commentDTO,
                PostCommentType.COMMENT,
                null,
                spaceId,
                post,
                null
        );
        try {
            PostComment savedComment = postCommentRepository.save(postComment);
            return mapper.mapToPostCommentResponse(savedComment);
        } catch (Exception e) {
            System.out.println(e.getMessage());
            throw new DatabaseOperationException(
                    "\uD83D\uDE15 Uh-oh! Your comment wasn't saved. Try again later!",
                    "save"
            );
        }
    }

    protected PostComment addReplyToComment(
            PostCommentRequest commentDTO, Long spaceId, Post post
    ) {
        Optional<PostComment> optionalPostComment = postCommentRepository
                .findByCommentId(commentDTO.getParentId());

        if(optionalPostComment.isEmpty())
            throw new ResourceFoundException(
                "\\uD83E\\uDD14 Hmm... looks like this comment is gone. You can't reply to it."
            );

        PostComment parentComment = optionalPostComment.get();
        var reply = createPostComment(
                commentDTO,
                PostCommentType.REPLY,
                commentDTO.getPrefix(),
                spaceId,
                post,
                parentComment
        );
        try {
            postCommentRepository.updateReplyCount(
                    commentDTO.getParentId(), LocalDateTime.now()
            );
            return postCommentRepository.save(reply);
        } catch (Exception e) {
            System.out.println(e.getMessage());
            throw new DatabaseOperationException(
                    "\uD83D\uDE15 Oops! Something went wrong. We couldn't post your reply",
                    ""
            );
        }
    }

    private PostComment createPostComment(
            PostCommentRequest commentDTO,
            PostCommentType type,
            String prefixes,
            Long spaceId,
            Post post,
            PostComment parentComment
    ) {
        return PostComment.builder()
                .payload(commentDTO.getPayload())
                .commentType(type)
                .commentedOn(LocalDateTime.now())
                .memberId(commentDTO.getMemberId())
                .spaceId(spaceId)
                .prefixes(prefixes)
                .post(post)
                .parentComment(parentComment)
                .replyCount(0)
                .build();
    }

    @Transactional
    @Override
    public void removePostComment(
            Long postId, Long memberId, Long spaceId, Long commentId
    ) {
        boolean isExists = postCommentRepository.existsByIdAndMember(commentId, memberId);
        if (isExists) {
            try {
                postCommentRepository.deleteById(commentId);
            } catch (Exception e) {
                System.out.println(e.getMessage());
                throw new DatabaseOperationException(
                        "There's a problem removing your comment.", ""
                );
            }
        }
        var payload = payloadMapper.mapToRemovePostCommentPayload(memberId, postId, commentId);
        redisService.publishMessage(
                String.format("/sub/space/%s", spaceId), payload
        );
    }


    @Transactional
    @Override
    public void deleteCommentReply(
            Long commentId, Long parentId, Long memberId, Long spaceId
    ) {
        var comment = postCommentRepository.findById(commentId)
                .orElseThrow(() -> new EntityNotFoundException("We can't find that reply."));

        if(!comment.getMemberId().equals(memberId) ||
                !comment.getCommentType().equals(PostCommentType.REPLY)
        ) {
            throw new OperationFailedException("Nope! You can't delete this reply.");
        }
        try {
            postCommentRepository.removeReplyCount(parentId);
            postCommentRepository.deleteById(commentId);
        } catch (Exception e) {
            System.out.println(e.getMessage());
            throw new DatabaseOperationException(
                    "Uh-oh! There was an issue deleting the reply",
                    "There is an error occurred in deletePostComments in CommentService by delete " +
                            "-P %s %s".formatted(commentId, e.getMessage())
            );
        }

        var payload = payloadMapper.mapToRemoveCommentReplyPayload(
                memberId, comment.getPost().getPostId(), commentId
        );
        redisService.publishMessage(
                String.format("/sub/space/%s", spaceId), payload
        );
    }


    @Transactional
    @Override
    public PageResponse<PostCommentResponse> getPostComments(Long postId, Long spaceId, int page) {
        boolean isPostExists = postService.existsByPostIdAndSpaceId(postId, spaceId);
        if (!isPostExists) {
            throw new OperationFailedException(
                    "You do not have permissions to access this comment"
            );
        }

        Pageable pageable = PageRequest.of(page, 20);
        Page<PostCommentResponse> postCommentPage = postCommentRepository.getPostCommentByPostId(postId, pageable);
        return new PageResponse<>(
                postCommentPage.getContent(),
                postCommentPage.getNumber(),
                postCommentPage.getTotalElements(),
                postCommentPage.getTotalPages(),
                postCommentPage.isFirst(),
                postCommentPage.isLast(),
                postCommentPage.hasNext(),
                postCommentPage.hasPrevious()
        );
    }

    @Transactional
    @Override
    public PageResponse<PostCommentDTO> getPostCommentReplies(
            Long parentCommentId, Long spaceId, int page, int size
    ) {
        boolean isParentCommentExists = postCommentRepository
                .existsByCommentAndSpaceId(parentCommentId, spaceId);

        if (!isParentCommentExists) {
            throw new EntityNotFoundException(
                    "The comment you looking is not exists."
            );
        }

        return getPageReplies(page, size, parentCommentId);
    }

    public PageResponse<PostCommentDTO> getPageReplies(int page, int size, Long parentCommentId) {
        Pageable pageable = PageRequest.of(page, size);
        Page<PostCommentDTO> postCommentPage = postCommentRepository.getRepliesByCommentId(parentCommentId, pageable);

        return new PageResponse<>(
                postCommentPage.getContent(),
                postCommentPage.getNumber(),
                postCommentPage.getTotalElements(),
                postCommentPage.getTotalPages(),
                postCommentPage.isFirst(),
                postCommentPage.isLast(),
                postCommentPage.hasNext(),
                postCommentPage.hasPrevious()
        );
    }

    @Transactional
    @Override
    public void removeCommentsByMember(Long memberId) {
        try {
            postCommentRepository.deleteAllByMemberId(memberId);
        } catch (Exception e) {
            throw new DatabaseOperationException(e.getMessage(),
                    "There is an error occurred in removeCommentsByMember in CommentService by delete" +
                            " -P %s".formatted(memberId)
            );
        }
    }
}