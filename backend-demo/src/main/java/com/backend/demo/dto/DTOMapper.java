package com.backend.demo.dto;

import com.backend.demo.emoji.Emoji;
import com.backend.demo.redis.OnlineUserService;
import com.backend.demo.member.MemberType;
import com.backend.demo.post.ImageService;
import com.backend.demo.post.Post;
import com.backend.demo.postcomment.PostComment;
import com.backend.demo.projections.MemberInfoProjection;
import com.backend.demo.projections.SpaceCardProjection;
import com.backend.demo.space.Space;
import com.backend.demo.text.Text;
import com.backend.demo.textresponse.TextMessage;
import com.backend.demo.user.User;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;


@Service
public class DTOMapper {

    private final ImageService imageService;
    private final OnlineUserService onlineUserService;

    public DTOMapper(ImageService imageService, OnlineUserService onlineUserService) {
        this.imageService = imageService;
        this.onlineUserService = onlineUserService;
    }

    public UserDTO mapToUserDTO(User user) {
        return UserDTO.builder()
                .userId(user.getUserId())
                .name(user.getName())
                .username(user.getUsername())
                .profile(user.getProfileUrl())
                .status(user.getStatus())
                .build();
    }

    public CurrentUserDTO mapToCurrentUser(User user) {
        return CurrentUserDTO.builder()
                .userId(user.getUserId())
                .username(user.getUsername())
                .email(user.getEmail())
                .profile(user.getProfileUrl())
                .status(user.getStatus())
                .name(user.getName())
                .build();
    }


    public MemberDTO mapToMemberDTO(MemberInfoProjection member) {
        var isOnline = onlineUserService.isUserOnline(member.getUserId());
        return MemberDTO.builder()
                .memberId(member.getMemberId())
                .isAdmin(member.getMemberType().equals(MemberType.MANAGER))
                .streak(member.getStreak())
                .lastStreak(member.getLastStreak())
                .user(UserDTO.builder()
                        .userId(member.getUserId())
                        .username(member.getUsername())
                        .name(member.getName())
                        .profile(member.getProfile())
                        .status(member.getStatus())
                        .build())
                .joinedOn(member.getJoinedOn())
                .spaceId(member.getSpaceId())
                .isUserOnline(isOnline)
                .build();
    }


    public Map<String, Object> mapToPostDTOWithEmojis(Post post) {
        var postDTO = mapToPostDTO(post);
        var emojiDTOList = mapEmojiListToDTOs(post.getEmojis(), post.getPostId());
        return Map.of(
                "post", postDTO,
                "emojis", emojiDTOList
        );
    }



    public List<EmojiDTO> mapEmojiListToDTOs(List<Emoji> emojis, Long postId) {
        if (emojis == null) {
            return Collections.emptyList();
        }
        return emojis.stream()
                .map(e -> EmojiDTO.builder()
                        .emojiId(e.getId())
                        .emojiMember(e.getMemberId())
                        .emojis(e.getEmojis())
                        .postId(postId)
                        .build())
                .collect(Collectors.toList());
    }


    public PostDTO mapToPostDTO(Post post) {
        var aspectRatio = imageService.getAspectRatio(post.getWidth(), post.getHeight());

        return PostDTO.builder()
                .postId(post.getPostId())
                .image(post.getUrl())
                .caption(post.getExpression())
                .sharedOn(post.getSharedOn())
                .width(post.getWidth())
                .height(post.getHeight())
                .aspectRatio(aspectRatio)
                .memberId(post.getMemberId())
                .spaceId(post.getSpaceId())
                .build();
    }



    public SpaceDTO mapToSpaceDTO(SpaceCardProjection space) {
        return SpaceDTO.builder()
                .spaceId(space.getSpaceId())
                .spacename(space.getSpacename())
                .uniqueId(space.getUniqueId())
                .build();
    }

    public Space mapToSpace(CreateSpaceRequest request, User user) {
        return Space.builder()
                .spacename(request.getSpaceName())
                .uniqueId(request.getSpaceId())
                .registeredOn(LocalDate.now())
                .admin(user)
                .build();
    }

    public ProfileInfo mapToProfileInfo(
            List<UserDTO> friends, List<SpaceDTO> spaces
    ) {
        return ProfileInfo.builder()
                .friendsCount(friends.size())
                .spacesCount(spaces.size())
                .friends(friends)
                .spaces(spaces)
                .build();
    }

    public CurrentUserSpaceDTO mapToCurrentUserSpaceDTO(Space space, Long userId) {
        return CurrentUserSpaceDTO
                .builder()
                .spaceId(space.getSpaceId())
                .spacename(space.getSpacename())
                .uniqueId(space.getUniqueId())
                .admin(Objects.equals(space.getAdmin().getUserId(), userId))
                .build();
    }

    public TextDTO mapToTextDTO(Text text, boolean isLiked) {
        List<Long> taggedList = text.getTagged() != null && !text.getTagged().isEmpty()
                ? Arrays.stream(text.getTagged().split(","))
                .map(Long::parseLong)
                .toList() : new ArrayList<>();

        return TextDTO.builder()
                .textId(text.getTextId())
                .createdOn(text.getCreatedOn())
                .isAnonymous(text.isAnonymous())
                .text(text.getText())
                .likesCount(text.getLikesCount())
                .messagesCount(text.getMessagesCount())
                .tagged(taggedList)
                .memberId(text.isAnonymous() ? 0L : text.getMemberId())
                .spaceId(text.getSpaceId())
                .isLiked(isLiked)
                .lastUpdatedOn(text.getLastUpdatedOn())
                .build();
    }

    public TextMessageDTO mapToTextMessageDTO(TextMessage textMessage) {
        return TextMessageDTO
                .builder()
                .id(textMessage.getId())
                .message(textMessage.getMessage())
                .type(textMessage.getType())
                .textId(textMessage.getText().getTextId())
                .prefixes(textMessage.getPrefixes())
                .spaceId(textMessage.getSpaceId())
                .memberId(textMessage.getMemberId())
                .timeStamp(textMessage.getTimeStamp())
                .build();
    }

    public TextMessage mapToTextMessage(
            CreateTextMessage messageDTO,
            Long spaceId, Text text
    ) {
        return TextMessage.builder()
                .message(messageDTO.getMessage())
                .type(messageDTO.getType())
                .timeStamp(LocalDateTime.now())
                .prefixes(messageDTO.getPrefixes())
                .spaceId(spaceId)
                .memberId(messageDTO.getMemberId())
                .text(text)
                .build();
    }

    public PostCommentResponse mapToPostCommentResponse(PostComment postComment) {
        return PostCommentResponse.builder()
                .commentId(postComment.getCommentId())
                .payload(postComment.getPayload())
                .commentType(postComment.getCommentType())
                .postId(postComment.getPost().getPostId())
                .prefixes(postComment.getPrefixes())
                .spaceId(postComment.getSpaceId())
                .memberId(postComment.getMemberId())
                .commentedOn(postComment.getCommentedOn())
                .lastUpdatedOn(postComment.getLastUpdatedOn())
                .replyCount(postComment.getReplyCount())
                .build();
    }

    public PostCommentDTO mapToPostCommentDTO(PostComment postComment) {
        return PostCommentDTO
                .builder()
                .commentId(postComment.getCommentId())
                .payload(postComment.getPayload())
                .commentType(postComment.getCommentType())
                .postId(postComment.getPost().getPostId())
                .prefixes(postComment.getPrefixes())
                .parentId(postComment.getParentComment().getCommentId())
                .spaceId(postComment.getSpaceId())
                .memberId(postComment.getMemberId())
                .commentedOn(postComment.getCommentedOn())
                .lastUpdatedOn(postComment.getLastUpdatedOn())
                .build();
    }
}

// mapper