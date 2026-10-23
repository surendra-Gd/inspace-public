package com.backend.demo.post;

import com.backend.demo.emoji.EmojiService;
import com.backend.demo.exception.InvalidCredentialsException;
import com.backend.demo.postcomment.PostCommentService;
import com.backend.demo.security.SpaceSecured;
import com.backend.demo.security.ValidationService;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;


@RestController
@RequestMapping("api/v1/in-space/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;
    private final EmojiService emojiService;
    private final ValidationService validationService;
    private final PostCommentService commentService;



    @PostMapping(
            value = "/upload",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    @SpaceSecured
    public ResponseEntity<?> uploadPost(
            @RequestAttribute("memberId") Long memberId,
            @RequestAttribute("spaceId") Long spaceId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "caption", required = false) String caption
    ) throws IOException {
        if (caption != null && !caption.trim().isEmpty()) {
            var isValidCaption = validationService.isCaptionValid(caption);
            if (!isValidCaption) {
                throw new InvalidCredentialsException("Expression contains invalid characters");
            }
        }
        var response = postService.uploadPost(memberId, spaceId, file, caption);
        return ResponseEntity.ok(response);
    }


    @GetMapping(
            value = "/feed",
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    @SpaceSecured
    public ResponseEntity<?> getSpaceFeed(
            @RequestAttribute("spaceId") Long spaceId
    ) {
        return postService.getSpaceFeed(spaceId);
    }


    @GetMapping(
            value = "/member/{memberId}",
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    @SpaceSecured
    public ResponseEntity<?> getMemberPosts(
            @PathVariable("memberId") @Min(1) Long memberId,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestAttribute("spaceId") Long spaceId
    ) {
        return postService.getMemberPostsByMemberId(memberId, page, spaceId);
    }


    @GetMapping("/today-count")
    @SpaceSecured
    public ResponseEntity<?> userPostLimit(
            @RequestAttribute("memberId") Long memberId
    ) {

        var count = postService.postLimit(memberId);
        return ResponseEntity.ok(count);
    }

    @GetMapping("/{postId}")
    @SpaceSecured
    public ResponseEntity<?> getPost(
            @PathVariable("postId") @Min(1) Long postId,
            @RequestAttribute("spaceId") Long spaceId
    ) {
        var response = postService.getPostById(postId, spaceId);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{postId}")
    @SpaceSecured
    public ResponseEntity<?> removePost(
            @PathVariable("postId") @Min(1) Long postId,
            @RequestAttribute("spaceId") Long spaceId,
            @RequestAttribute("memberId") Long memberId
    ) {
        postService.removePostById(postId, spaceId, memberId);
        return ResponseEntity.ok().build();
    }


    @GetMapping("/responses/{postId}")
    @SpaceSecured
    public ResponseEntity<?> getPostResponses(
            @PathVariable("postId") @Min(1) Long postId,
            @RequestAttribute("spaceId") Long spaceId
    ) {
        return postService.getPostResponses(postId, spaceId);
    }

    @GetMapping("/{postId}/comments")
    @SpaceSecured
    public ResponseEntity<?> getPostComments(
            @PathVariable("postId") @Min(1) Long postId,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestAttribute("spaceId") Long spaceId
    ) {
        var pageResponse =  commentService.getPostComments(postId, spaceId, page);
        return ResponseEntity.ok(pageResponse);
    }

    @GetMapping("/replies/{commentId}")
    @SpaceSecured
    public ResponseEntity<?> getCommentReplies(
            @PathVariable("commentId") @Min(1) Long commentId,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestAttribute("spaceId") Long spaceId
    ) {
        var pageResponse = commentService.getPostCommentReplies(
                commentId, spaceId, page, 30
        );
        return ResponseEntity.ok(pageResponse);
    }
}