package com.backend.demo.post;

import com.backend.demo.notification.NotificationService;
import com.backend.demo.payload.Action;
import com.backend.demo.payload.DeletePostPayload;
import com.backend.demo.postcomment.PostCommentService;
import com.backend.demo.redis.LoadingCache;
import com.backend.demo.common.PageResponse;
import com.backend.demo.dto.DTOMapper;
import com.backend.demo.dto.PostDTO;
import com.backend.demo.dto.PostResponseDTO;
import com.backend.demo.emoji.EmojiService;
import com.backend.demo.exception.*;
import com.backend.demo.member.MemberService;
import com.backend.demo.projections.PostDeleteProjection;
import com.backend.demo.redis.RedisService;
import com.backend.demo.s3.S3Service;
import com.backend.demo.streak.StreakService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.services.s3.model.ObjectIdentifier;

import java.io.IOException;
import java.security.SecureRandom;
import java.time.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PostServiceImpl implements PostService {

    private final MemberService memberService;
    private final LoadingCache cache;
    private final PostRepository postRepository;
    private final ImageService imageService;
    private final DTOMapper mapper;
    private final S3Service s3;
    private final PostCommentService commentService;
    private final RedisService redisService;
    @Value("${aws.s3.buckets.post}")
    private String bucket;
    private final EmojiService emojiService;
    private final NotificationService notificationService;
    private final StreakService streakService;



    @Transactional
    @Override
    public Map<String, Object> uploadPost(
            Long memberId, Long spaceId, MultipartFile file, String caption
    ) throws IOException {

        String cacheKey = cache.getCacheKey(memberId);

        if (Boolean.TRUE.equals(cache.isLoading(cacheKey))) {
            throw new OperationNotPermittedException(
                    "Your previous post is still uploading. Please wait..."
            );
        }

        boolean memberExists = memberService.existsByMember(memberId, spaceId);
        if(!memberExists) {
            throw new OperationFailedException("Member Not Found");
        }
        var checkLimit = postLimit(memberId);
        if(checkLimit > 3) {
            throw new OperationNotPermittedException("you reached upload limit");
        }

        imageService.processImage(file);

        var dimensions = imageService.getImageDimensions(file);
        var width = dimensions[0];
        var height = dimensions[1];

        String type = imageService.detectMimeType(file.getInputStream());
        String key = generateObjectKey(type);

        try {
            cache.markLoading(cacheKey);
            String version = s3.putObject(
                    bucket, key, file, "max-age=86400, public", type
            ).versionId();
            String url = s3.generatePreSignUrl(key, bucket, version);

            Post post = Post.builder()
                    .spaceId(spaceId)
                    .memberId(memberId)
                    .sharedOn(LocalDateTime.now())
                    .expression(caption)
                    .imageKey(key)
                    .versionId(version)
                    .url(url)
                    .width(width)
                    .height(height)
                    .generatedOn(Instant.now())
                    .expiredOn(Instant.now().plus(Duration.ofDays(7)))
                    .build();

            var savedPost = postRepository.save(post);

            int streak = streakService.addTodayStreak(15, memberId);
            notificationService.notificationOnNewPost(
                    spaceId, savedPost.getPostId(), memberId, streak
            );

            Map<String, Object> response = new HashMap<>();
            response.put("content", mapper.mapToPostDTO(savedPost));
            response.put("streak", streak);
            return response;

        } catch (Exception e) {
            throw new DatabaseOperationException(e.getMessage(),
                    "There is an error occurred in uploadPost in PostService by save"
            );
        } finally {
            cache.clear(cacheKey);
        }
    }

    private String generateObjectKey(String type) {
        var characters = "1234567890abcdefghijklmnopqrstuvwxyz_";
        SecureRandom secureRandom = new SecureRandom();
        var extension = imageService.determineExtension(type);
        String key;
        do {
            StringBuilder codeBuilder = new StringBuilder();
            for (int i = 0; i < 100; i++) {
                int randomIndex = secureRandom.nextInt(characters.length());
                codeBuilder.append(characters.charAt(randomIndex));
            }
            key = codeBuilder + extension;
        } while (postRepository.existsByImageKey(key));
        return key;
    }



    @Override
    public Long postLimit(Long memberId) {
        LocalDate today = LocalDate.now();
        LocalDateTime startOfDay = today.atStartOfDay();
        LocalDateTime endOfDay = today.atTime(LocalTime.MAX);

        try {
            return postRepository.countPostsByUserIdAndTimeRange(memberId, startOfDay, endOfDay);
        } catch (Exception e) {
            throw new DatabaseOperationException(e.getMessage(),
                    "There is an error occurred in postLimit in PostService by get " +
                            "-P %s, %s, %s".formatted(memberId, startOfDay, endOfDay)
            );
        }
    }


    // Todo: check expired posts also from s3.
    @Override
    public ResponseEntity<?> getMemberPostsByMemberId(
            Long memberId, int page, Long spaceId
    ) {
        boolean memberExists = memberService.existsByMember(memberId, spaceId);
        if(!memberExists) {
            throw new OperationFailedException("Member Not Found");
        }
        Pageable pageable = PageRequest.of(
                page, 20, Sort.by("sharedOn").descending()
        );
        Page<Post> posts = postRepository.getPostsByMemberId(memberId, pageable);
        var res = checkExpirationAndSave(posts.getContent());
        var response = new PageResponse<>(
                res,
                posts.getNumber(),
                posts.getTotalElements(),
                posts.getTotalPages(),
                posts.isFirst(),
                posts.isLast(),
                posts.hasNext(),
                posts.hasPrevious()
        );
        return ResponseEntity.ok(response);
    }


    // Todo: small changes.
    private List<PostDTO> checkExpirationAndSave(List<Post> posts) {
        Instant now = Instant.now().plus(Duration.ofDays(1));
        List<Post> expiredPosts = new ArrayList<>();
        List<PostDTO> response = posts.stream()
                .map(post -> {
                    if (post.getExpiredOn().isBefore(now)) {
                        Post newPost = regenerateUrl(post);
                        expiredPosts.add(newPost);
                        return mapper.mapToPostDTO(newPost);
                    }
                    return mapper.mapToPostDTO(post);
                }).toList();
        if (!expiredPosts.isEmpty()) {
            try {
                postRepository.saveAll(expiredPosts);
            } catch (Exception e) {
                throw new DatabaseOperationException(e.getMessage(),
                        "There is an error occurred in checkExpirationAndSave in PostService by save " +
                                "-P %s".formatted(expiredPosts)
                );
            }
        }
        return response;
    }


    private Post regenerateUrl(Post post) {
        try {
            System.out.println("Going to post regenerate url: " + post.toString());
            String key = post.getImageKey();
            String version = post.getVersionId();
            String newUrl = s3.generatePreSignUrl(key, bucket, version);
            post.setUrl(newUrl);
            post.setGeneratedOn(Instant.now());
            post.setExpiredOn(Instant.now().plus(Duration.ofDays(7)));
        } catch (Exception e) {
            throw new RuntimeException("Error regenerating presign url. Please try again");
        }
        return post;
    }


    @Override
    public ResponseEntity<?> getSpaceFeed(Long spaceId) {
        LocalDate today = LocalDate.now();
        ZoneId zone = ZoneId.systemDefault();
        LocalDateTime startOfDay = today.atStartOfDay(zone).toLocalDateTime();
        LocalDateTime endOfDay = today.atTime(LocalTime.MAX).atZone(zone).toLocalDateTime();
        try {
            var posts = postRepository.getTodayPostsBySpaceId(spaceId, startOfDay, endOfDay);
            var response = posts.stream().map(mapper::mapToPostDTOWithEmojis).toList();
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            throw new DatabaseOperationException(e.getMessage(),
                    "There is an error occurred in getSpaceFeed in PostService by get " +
                            "-P %s, %s, %s".formatted(spaceId, startOfDay, endOfDay)
            );
        }
    }


    @Async
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    @Override
    public void deletePostsBySpace(Long spaceId) {
        var posts = postRepository.getPostsBySpaceId(spaceId);
        if(posts.isEmpty()) return;
        List<ObjectIdentifier> objects = posts.stream()
                .map(this::mapToIdentifier)
                .toList();
        try {
            postRepository.deletePostsBySpaceId(spaceId);
            s3.deleteBucketObjects(bucket, objects);
        } catch (Exception e) {
            throw new DatabaseOperationException(e.getMessage(),
                    "There is an error occurred in deletePostsBySpace in PostService by delete " +
                            "-P %s".formatted(spaceId)
            );
        }
    }

    private ObjectIdentifier mapToIdentifier(PostDeleteProjection post) {
        return ObjectIdentifier.builder()
                .key(post.getImageKey())
                .versionId(post.getVersionId())
                .build();
    }


    public PostDTO getPostById(Long postId, Long spaceId) {
        Post post = getPostByPostId(postId);
        if(!post.getSpaceId().equals(spaceId)) {
            throw new AccessDeniedException("We do not have permissions to access this post");
        }
        return mapper.mapToPostDTO(post);
    }


    @Override
    public void removePostById(Long postId, Long spaceId, Long memberId) {
        var post = postRepository.findByPostId(postId)
                .orElseThrow(() -> new ResourceNotFoundException("post not found"));
        try {
            s3.deleteObject(post.getImageKey(), post.getVersionId(), bucket);
            postRepository.deletePostByPostId(postId);

            String channel = String.format("/sub/space/%s", spaceId);
            DeletePostPayload payload = DeletePostPayload.builder()
                    .action(Action.WS_DELETE_POST)
                    .postId(postId)
                    .memberId(memberId)
                    .spaceId(spaceId)
                    .build();

            redisService.publishMessage(channel, payload);
        } catch (Exception e) {
            throw new DatabaseOperationException(e.getMessage(),
                    "There is an error occurred in removePostById in PostService at delete " +
                            "-P %s".formatted(postId)
            );
        }
    }

    @Override
    public Post getPostByPostId(Long postId) {
        return postRepository.findPostByPostId(postId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Sorry We could not find post!"
                ));
    }



    @Override
    public void removePostsByMemberId(Long memberId) {
        var posts = postRepository.getPostsByMemberId(memberId);
        if(posts.isEmpty()) return;
        List<ObjectIdentifier> objects = posts.stream()
                .map(this::mapToIdentifier)
                .toList();
        try {
            postRepository.deletePostsByMemberId(memberId);
            s3.deleteBucketObjects(bucket, objects);
        } catch (Exception e) {
            throw new DatabaseOperationException(e.getMessage(),
                    "There is an error occurred in removePostsByMemberId in PostService by delete " +
                            "-P %s".formatted(memberId)
            );
        }
    }


    // Getting first page of comments and replies
    @Override
    public ResponseEntity<?> getPostResponses(Long postId, Long spaceId) {
        var removedMembers = memberService.getRemovedMembers(spaceId);

        var emojis = emojiService.getEmojisByPost(postId, spaceId).stream()
                .filter(emoji -> !removedMembers.contains(emoji.getEmojiMember()))
                .toList();
        var comments = commentService.getPostComments(postId, spaceId, 0);

        var response = PostResponseDTO.builder()
                .emojis(emojis)
                .comments(comments)
                .build();
        return ResponseEntity.ok(response);
    }

    @Override
    public boolean existsByPostIdAndSpaceId(Long postId, Long spaceId) {
        return postRepository.existsByPostIdAndSpaceId(postId, spaceId);
    }

}