package com.backend.demo.postcomment;

import com.backend.demo.common.PageResponse;
import com.backend.demo.dto.PostCommentDTO;
import com.backend.demo.dto.PostCommentResponse;
import com.backend.demo.user.User;
import org.springframework.transaction.annotation.Transactional;

public interface PostCommentService {
    void addCommentOrReply(
            PostCommentRequest commentDTO, Long spaceId, User user
    );

    @Transactional
    void removePostComment(
            Long postId, Long memberId, Long spaceId, Long commentId
    );

    @Transactional
    void deleteCommentReply(
            Long commentId, Long parentId, Long memberId, Long spaceId
    );

    @Transactional
    PageResponse<PostCommentResponse> getPostComments(Long postId, Long spaceId, int page);

    @Transactional
    PageResponse<PostCommentDTO> getPostCommentReplies(
            Long parentCommentId, Long spaceId, int page, int size
    );

    @Transactional
    void removeCommentsByMember(Long memberId);
}
