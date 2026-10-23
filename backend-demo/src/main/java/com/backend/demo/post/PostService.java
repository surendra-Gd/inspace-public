package com.backend.demo.post;

import com.backend.demo.dto.PostDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Async;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

public interface PostService {
    Map<String, Object> uploadPost(
            Long memberId,
            Long spaceId,
            MultipartFile file,
            String caption
    ) throws IOException;

    Long postLimit(Long memberId);

    // Todo: check expired posts also from s3.
    ResponseEntity<?> getMemberPostsByMemberId(
            Long memberId, int page, Long spaceId
    );


    ResponseEntity<?> getSpaceFeed(Long spaceId);

    @Async
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    void deletePostsBySpace(Long spaceId);

    void removePostById(Long postId, Long spaceId, Long memberId);

    PostDTO getPostById(Long postId, Long spaceId);

    // get post by post id
    Post getPostByPostId(Long postId);


    // Todo: Enable spring built in cache for some loading states.
    void removePostsByMemberId(Long memberId);

    ResponseEntity<?> getPostResponses(Long postId, Long spaceId);

    boolean existsByPostIdAndSpaceId(Long postId, Long spaceId);

}
