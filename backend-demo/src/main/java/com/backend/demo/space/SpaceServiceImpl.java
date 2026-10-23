package com.backend.demo.space;

import com.backend.demo.activity.ActivityService;
import com.backend.demo.dto.CurrentUserSpaceDTO;
import com.backend.demo.dto.DTOMapper;
import com.backend.demo.dto.AdminActionResponse;
import com.backend.demo.email.EmailSender;
import com.backend.demo.emoji.EmojiService;
import com.backend.demo.exception.*;
import com.backend.demo.dto.CreateSpaceRequest;
import com.backend.demo.dto.SpaceDTO;
import com.backend.demo.notification.NotificationService;
import com.backend.demo.post.PostService;
import com.backend.demo.member.*;
import com.backend.demo.activity.Prompt;
import com.backend.demo.postcomment.PostCommentService;
import com.backend.demo.projections.SpaceCardProjection;
import com.backend.demo.projections.SpaceProjection;
import com.backend.demo.projections.SpaceTokenProjection;
import com.backend.demo.text.TextService;
import com.backend.demo.textresponse.TextMessageService;
import com.backend.demo.user.User;
import com.backend.demo.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Objects;

import static com.backend.demo.member.MemberStatus.ACTIVE;
import static com.backend.demo.member.MemberStatus.REMOVED;

@Service
@RequiredArgsConstructor
public class SpaceServiceImpl implements SpaceService {

    private final MemberRepository memberRepository;
    private final UserService userService;
    private final ActivityService activityService;
    private final SpaceRepository spaceRepository;
    private final MemberService memberService;
    private final PostService postService;
    private final EmojiService emojiService;
    private final DTOMapper mapper;
    private final EmailSender emailService;
    private final NotificationService notificationService;
    private final TextService textService;
    private final PostCommentService postCommentService;
    private final TextMessageService textMessageService;

    @Transactional
    @Override
    public CurrentUserSpaceDTO createSpace(CreateSpaceRequest request) {
        User user = userService.currentUser();
        var uniqueIdExists = spaceRepository.existsByUniqueId(request.getSpaceId());
        if(uniqueIdExists) {
            throw new ResourceFoundException(
                    "The provided spacename <%s> is already used. Please use different one.".formatted(request.getSpaceId())
            );
        }
        var userSpace = mapper.mapToSpace(request, user);
        try {
            var registeredSpace = spaceRepository.save(userSpace);
            MemberType type = MemberType.MANAGER;
            addMember(user, registeredSpace, type);
            return mapper.mapToCurrentUserSpaceDTO(registeredSpace, user.getUserId());
        } catch (Exception e) {
            throw new DatabaseOperationException(e.getMessage(),
                    "There is an error occurred in createSpace in SpaceService by save " +
                            "-P %s".formatted(userSpace)
            );
        }
    }



    @Override
    @Transactional
    public AdminActionResponse acceptTheMember(User user, Space space) {
        var optionalMember = memberRepository
                .getMemberIdByUserIdAndSpaceId(user.getUserId(), space.getSpaceId());
        if(optionalMember.isPresent()) {
            var memberId = optionalMember.get();
            memberRepository.updateMemberStatus(memberId, ACTIVE);
            Long activityId = activityService.addActivity(
                    space.getSpaceId(), user, Prompt.JOINED
            );
            return new AdminActionResponse(
                    memberId, activityId, LocalDate.now()
            );
        }
        var memberId = addMember(user, space, MemberType.MEMBER);
        Long activityId = activityService.addActivity(
                space.getSpaceId(), user, Prompt.JOINED
        );

        // Notification 🚩
        notificationService.notificationOnNewMemberJoin(
                space.getSpaceId(), user.getUsername(),
                user.getProfileUrl(), user.getUserId(), memberId
        );

        return new AdminActionResponse(
                memberId, activityId, LocalDate.now()
        );
    }


    private Long addMember(User user, Space space, MemberType type) {
        SpaceMember member = SpaceMember.builder()
                .member(user)
                .space(space)
                .memberType(type)
                .memberStatus(ACTIVE)
                .joinedOn(LocalDate.now())
                .lastStreakModified(LocalDate.now())
                .totalStreak(10)
                .lastStreak(10)
                .build();
        try {
            return memberRepository.save(member).getMemberId();
        } catch (Exception e) {
            throw new DatabaseOperationException(e.getMessage(),
                    "There is an error in addMember in SpaceService by save " +
                            "-P %s".formatted(member)
            );
        }
    }


    @Override
    public ResponseEntity<?> getSpaceForJoin(String uniqueId) {
        SpaceDTO response = spaceRepository.findByUniqueId(uniqueId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "%s not found".formatted(uniqueId)
                ));
        return new ResponseEntity<>(response, HttpStatus.OK);
    }


    @Override
    public ResponseEntity<?> getCurrentUserSpaces() {
        Long userId = userService.currentUser().getUserId();
        List<CurrentUserSpaceDTO> spaces =  memberService.getSpaceByMemberUserId(userId).stream()
                .map(space-> mapToCurrentUser(space, userId))
                .toList();
        return ResponseEntity.ok(spaces);
    }

    private CurrentUserSpaceDTO mapToCurrentUser(SpaceCardProjection space, Long userId) {
        return CurrentUserSpaceDTO.builder()
                .spaceId(space.getSpaceId())
                .uniqueId(space.getUniqueId())
                .spacename(space.getSpacename())
                .admin(Objects.equals(space.getAdminId(), userId))
                .build();
    }


    @Transactional
    @Modifying
    @Override
    public String updateSpacename(Long spaceId, String spacename) {
        var userId = userService.currentUser().getUserId();
        SpaceProjection space = spaceRepository.findSpaceDTOById(spaceId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "%s space not found.".formatted(spaceId)
                ));
        if(!space.getAdminId().equals(userId)) {
            throw new OperationNotPermittedException(
                    "You does not have a permission to change this space name"
            );
        }
        spaceRepository.updateSpaceName(spaceId, spacename);
        return spacename;
    }

    @Override
    public Space getSpaceById(Long spaceId) {
        return spaceRepository.findBySpaceId(spaceId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "space not found: " + spaceId
                ));
    }


    @Transactional
    @Override
    public ResponseEntity<?> deleteSpace(Long spaceId, String feedback) {
        var currentUser = userService.currentUser().getUserId();
        SpaceProjection space = spaceRepository.findSpaceDTOById(spaceId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "%s space not found.".formatted(spaceId)
                ));
        if(!space.getAdminId().equals(currentUser)) {
            throw new OperationNotPermittedException(
                    "You does not have permission to delete this space"
            );
        }
        var memberCount = memberService.getMemberCount(spaceId);
        if(memberCount > 1L) {
            throw new OperationFailedException(
                    "You cannot delete the space with members. " +
                            "please shift your admin and leave this space"
            );
        }

        var description = "user:%s, want to delete the space from space:%s".formatted(currentUser, spaceId);
        addFeedback(feedback, "delete space by admin", description);

        try {
            activityService.deleteAllBySpaceId(spaceId);
            spaceRepository.deleteSpaceBySpaceId(spaceId);
            postService.deletePostsBySpace(spaceId);
            textService.deleteTextsBySpace(spaceId);
        } catch (Exception e) {
            throw new DatabaseOperationException(e.getMessage(),
                    "There is an error on deleteSpace in SpaceService by SpaceService " +
                            "-P %s".formatted(spaceId)
            );
        }
        return ResponseEntity.ok(spaceId);
    }


    @Transactional
    @Override
    public void leaveSpace(Long memberId, Long spaceId, String feedback) {
        var user = userService.currentUser();
        SpaceMember member = memberService.getByMemberId(memberId);

        if(!member.getMember().getUserId().equals(user.getUserId())) {
            throw new AccessDeniedException("UnAuthorized Access");
        }
        if(!member.getSpace().getSpaceId().equals(spaceId)) {
            throw new AccessDeniedException(
                    "You are not member of this space"
            );
        }
        if(member.getMemberType().equals(MemberType.MANAGER)) {
            throw new OperationNotPermittedException(
                    "Please shift your administration role to other member"
            );
        }

        var description = "user:%s, want to leave the space from space:%s".formatted(user.getUserId(), member.getSpace().getUniqueId());
        addFeedback(feedback, "leave space", description);

        try {
            Prompt prompt = Prompt.LEFT;
            emojiService.removeEmojisByMember(memberId);
            postCommentService.removeCommentsByMember(memberId);
            memberService.removeMemberById(memberId);
            activityService.addActivity(spaceId, member.getMember(), prompt);
            postService.removePostsByMemberId(memberId);
            textMessageService.removeAllByMember(memberId);
            textService.removeTextsByMember(memberId);
        } catch (RuntimeException e) {
            throw new DatabaseOperationException(e.getMessage(),
                    "There is an error on leaveSpace in SpaceService by delete " +
                            "-P %s".formatted(memberId)
            );
        }
    }


    @Transactional
    @Override
    public ResponseEntity<?> removeMember(Long targetId, Long spaceId, String feedback) {
        var currentUser = userService.currentUser();
        Long currentUserId = currentUser.getUserId();

        SpaceMember member = memberService.getByMemberId(targetId);
        var space = member.getSpace();

        if(!space.getSpaceId().equals(spaceId)) {
            throw new OperationFailedException("UnAuthorized Access");
        }
        if(!space.getAdmin().getUserId().equals(currentUserId)) {
            throw new AccessDeniedException(
                    "You does not have permission to remove this user"
            );
        }
        if(member.getMemberStatus().equals(REMOVED)) {
            throw new OperationFailedException("Error: Member already removed");
        }
        
        var user = member.getMember();
        var description = "admin:%s, want to remove the user:%s from space:%s".formatted(
                currentUser.getUsername(), user.getUserId(), member.getSpace().getUniqueId()
        );
        addFeedback(feedback, "remover member by admin from space", description);


        try {
            member.setMemberStatus(REMOVED);
            memberRepository.save(member);
        } catch (RuntimeException e) {
            throw new DatabaseOperationException(e.getMessage(),
                    "There is an error occurred in removeMember in SpaceService by save " +
                            "-P %s".formatted(member)
            );
        }
        Prompt prompt = Prompt.REMOVE;
        var activityId = activityService.addActivity(spaceId, member.getMember(), prompt);
        var response = new AdminActionResponse(
                targetId, activityId, LocalDate.now()
        );
        return ResponseEntity.ok(response);
    }


    @Transactional
    @Override
    public void shiftAdmin(Long targetMember, Long memberId, Long spaceId) {
        if(Objects.equals(targetMember, memberId)) {
            throw new InvalidCredentialsException(
                    "You cannot shift admin to yourself"
            );
        }

        var admin = memberService.getByMemberId(memberId);
        if(!admin.getMemberType().equals(MemberType.MANAGER)) {
            throw new OperationNotPermittedException(
                    "your not an administrator of this space"
            );
        }

        SpaceMember member = memberService.getByMemberId(targetMember);
        if(!member.getSpace().getSpaceId().equals(spaceId)) {
            throw new OperationFailedException(
                    "You cannot shift admin to other space member"
            );
        }

        Space space = member.getSpace();
        User account = member.getMember();
        space.setAdmin(account);
        try {
            spaceRepository.save(space);
            memberService.updateMemberTypes(member, admin);
        } catch (Exception e) {
            throw new DatabaseOperationException(e.getMessage(),
                    "There is an error on shiftAdmin in SpaceService by save " +
                            "-P %s".formatted(space)
            );
        }
    }

    @Override
    public List<SpaceTokenProjection> getCurrentSpaceMembers() {
        Long userId = userService.getCurrentUser().getUserId();
        try {
            return memberRepository.getMembersByUserId(userId);
        } catch (Exception e) {
            throw new DatabaseOperationException(e.getMessage(),
                    "There is an error on getCurrentSpaceMembers in SpaceService by get " +
                            "-P %s".formatted(userId)
            );
        }
    }

    @Override
    public List<SpaceTokenProjection> getCurrentSpaceMembersByUser(Long userId) {
        try {
            return memberRepository.getMembersByUserId(userId);
        } catch (Exception e) {
            throw new DatabaseOperationException(e.getMessage(),
                    "There is an error on getCurrentSpaceMembers in SpaceService by get " +
                            "-P %s".formatted(userId)
            );
        }
    }

    @Override
    public List<Long> getSpaceIdsByUser(Long userId) {
        return memberRepository.getSpaceIdsByUser(userId);
    }


    private void addFeedback(String content, String scenario, String description) {
        var user = userService.currentUser();
        emailService.sendUserFeedBack(
                user.getUsername(),
                scenario,
                content,
                description
        );

    }

}