package com.backend.demo.emoji;


import com.backend.demo.dto.EmojiDTO;
import com.backend.demo.exception.*;
import com.backend.demo.post.Post;
import com.backend.demo.post.PostRepository;
import com.backend.demo.post.PostService;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;


@Service
public class EmojiServiceImpl implements EmojiService {

    private final EmojiRepository repository;
    private final PostService postService;
    private final PostRepository postRepository;

    public EmojiServiceImpl(EmojiRepository repository,
                            @Lazy PostService postService,
                            PostRepository postRepository) {
        this.repository = repository;
        this.postService = postService;
        this.postRepository = postRepository;
    }

    @Override
    public List<EmojiDTO> getEmojisByPost(Long postId, Long spaceId) {
        var postExists = postRepository.existsByPostId(postId);
        if(!postExists) {
            throw new ResourceNotFoundException("Post not found");
        }
        try {
            return repository.getPostEmojisByPostId(postId);
        } catch (Exception e) {
            throw new DatabaseOperationException(e.getMessage(),
                    "There is an error occurred on getEmojiByPost in EmojiService by get " +
                            "-P %s".formatted(postId)
            );
        }
    }


    @Override
    public Long addEmoji(EmojiDTO emojiDto, Long spaceId, Long memberId) {
        Long postId = emojiDto.getPostId();
        Post post = postService.getPostByPostId(postId);

        if (!post.getSpaceId().equals(spaceId)) {
            throw new AccessDeniedException("UnAuthorized Access");
        }

        Optional<EmojiDTO> optionalEmoji = repository.getEmojiByMappingIds(postId, memberId);
        if (optionalEmoji.isPresent()) {
            throw new EmojiFoundException(
                    "Emoji already found",
                    optionalEmoji.get(),
                    "Emoji Found"
            );
        }

        Emoji emoji = Emoji.builder()
                .post(post)
                .emojis(emojiDto.getEmojis())
                .memberId(memberId)
                .build();

        return repository.save(emoji).getId();
    }

    @Override
    public void removeEmoji(Long emojiId, Long memberId) {
        var existingEmojiMember = repository.getEmojiMemberById(emojiId)
                .orElseThrow(() -> new ResourceNotFoundException("Emoji Not Found"));

        if(!existingEmojiMember.equals(memberId)) {
            throw new AccessDeniedException("UnAuthorized Access");
        }
        try {
            repository.deleteEmojiById(emojiId);
        } catch (Exception e) {
            throw new DatabaseOperationException (e.getMessage(),
                    "There is an error occurred in removeEmoji in EmojiService by delete " +
                            "-P %s".formatted(emojiId)
            );
        }
    }

    @Transactional
    @Override
    public void removeEmojisByMember(Long memberId) {
        try {
            repository.deleteAllByMemberId(memberId);
        } catch (Exception e) {
            throw new DatabaseOperationException(e.getMessage(),
                    "There is an error occurred in removeEmojisByMember in EmojiService by delete" +
                            " -P %s".formatted(memberId)
            );
        }
    }

}