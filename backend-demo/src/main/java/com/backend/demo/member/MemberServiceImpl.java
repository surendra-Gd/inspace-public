package com.backend.demo.member;

import com.backend.demo.dto.DTOMapper;
import com.backend.demo.dto.SpaceInfo;
import com.backend.demo.dto.UserDTO;
import com.backend.demo.exception.AccessDeniedException;
import com.backend.demo.exception.DatabaseOperationException;
import com.backend.demo.exception.ResourceNotFoundException;
import com.backend.demo.projections.MemberInfoProjection;
import com.backend.demo.projections.SpaceCardProjection;
import com.backend.demo.projections.SpaceInfoProjection;
import com.backend.demo.user.UserService;
import com.backend.demo.space.SpaceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;


import java.util.List;


@Service
@RequiredArgsConstructor
public class MemberServiceImpl implements MemberService {

    private final SpaceRepository spaceRepository;
    private final MemberRepository memberRepository;
    private final UserService userService;
    private final DTOMapper mapper;

    @Override
    public ResponseEntity<?> getAllMembersBySpaceId(Long spaceId) {
        try {
            List<MemberInfoProjection> members = memberRepository.getMembersBySpaceId(spaceId);
            var response = members.stream()
                    .map(mapper::mapToMemberDTO)
                    .toList();
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            throw new DatabaseOperationException(e.getMessage(),
                    "There is an error occurred in getAllMembersBySpaceId in MemberService by get " +
                            "-P %s".formatted(spaceId)
            );
        }
    }


    @Override
    public ResponseEntity<?> getMemberBySpaceId(Long spaceId) {
        Long userId = userService.currentUser().getUserId();
        SpaceInfoProjection space = spaceRepository.findSpaceInfoBySpaceId(spaceId)
                .orElseThrow(() -> new ResourceNotFoundException("No such space found"));
        MemberInfoProjection member = memberRepository.getMemberBySpaceIdAndUserId(spaceId, userId)
                .orElseThrow(() -> new AccessDeniedException("UnAuthorized Access"));

        var response = SpaceInfo.builder()
                .spaceId(space.getSpaceId())
                .spacename(space.getSpaceName())
                .uniqueId(space.getUniqueId())
                .admin(mapToUserDTO(space))
                .member(mapper.mapToMemberDTO(member))
                .build();
        return ResponseEntity.ok(response);
    }

    private UserDTO mapToUserDTO(SpaceInfoProjection space) {
        return UserDTO.builder()
                .userId(space.getAdminUserId())
                .name(space.getAdminName())
                .username(space.getAdminUsername())
                .profile(space.getAdminProfileUrl())
                .status(space.getAdminStatus())
                .build();
    }

    @Override
    public boolean existsByMember(Long memberId, Long spaceId) {
        try {
            return memberRepository.existsByMemberIdAndSpaceId(memberId, spaceId);
        } catch (Exception e) {
            throw new DatabaseOperationException(e.getMessage(),
                    "There is an error occurred in existsByMember in MemberService by get " +
                            "-P %s, %s".formatted(memberId, spaceId)
            );
        }
    }

    // get spaces by user id in spaces page
    @Override
    public List<SpaceCardProjection> getSpaceByMemberUserId(Long userId) {
        try {
            return memberRepository.getSpacesByUserId(userId);
        } catch (Exception e) {
            throw new DatabaseOperationException(e.getMessage(),
                    "There is an error occurred in getSpaceByMemberUserId in MemberService my get " +
                            "-P %s".formatted(userId)
            );
        }
    }

    // get members to count in space for deletion
    @Override
    public ResponseEntity<?> getMembersCountById(Long spaceId) {
        var count = getMemberCount(spaceId);
        return ResponseEntity.ok(count);
    }

    @Override
    public Long getMemberCount(Long spaceId) {
        try {
            return memberRepository.countMembersById(spaceId);
        } catch (Exception e) {
            throw new DatabaseOperationException(e.getMessage(),
                    "There is an error occurred in getMemberCount in MemberService by get" +
                            " -P %s".formatted(spaceId)
            );
        }
    }

    // check the user is member of space or not
    @Override
    public Long isUserAsMember(Long userId, Long spaceId) {
        try {
            return memberRepository.getMemberIdByUserAndSpace(userId, spaceId)
                    .orElse(0L);
        } catch (Exception e) {
            throw new DatabaseOperationException(e.getMessage(),
                    "There is an error occurred in isUserAsMember in MemberService by get " +
                            "-P %s, %s".formatted(userId, spaceId)
            );
        }
    }

    @Override
    public SpaceMember getByMemberId(Long memberId) {
        return memberRepository.getSpaceMemberByMemberId(memberId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "member is not found"
                ));
    }


    @Override
    public void removeMemberById(Long memberId) {
        try {
            memberRepository.deleteSpaceMemberByMemberId(memberId);
        } catch (Exception e) {
            throw new DatabaseOperationException(e.getMessage(),
                    "There is an error occurred in removeMemberById in MemberService by delete " +
                            "-P %s".formatted(memberId)
            );
        }
    }

    @Modifying
    @Override
    public void updateMemberTypes(SpaceMember member, SpaceMember admin) {
        member.setMemberType(MemberType.MANAGER);
        admin.setMemberType(MemberType.MEMBER);
        List<SpaceMember> members = List.of(admin, member);
        try {
            memberRepository.saveAll(members);
        } catch (Exception e) {
            throw new DatabaseOperationException (e.getMessage(),
                    "There is an error occurred in updateMemberTypes in MemberService by saveAll" +
                            " -P %s".formatted(members)
            );
        }
    }

    @Override
    public ResponseEntity<?> getMemberById(
            Long targetMemberId, Long spaceId
    ) {
        var member = memberRepository.getActiveMemberById(targetMemberId)
                .orElseThrow(() -> new ResourceNotFoundException("Member not found"));
        if(!member.getSpaceId().equals(spaceId)) {
            throw new AccessDeniedException("No Permission");
        }
        return ResponseEntity.ok(mapper.mapToMemberDTO(member));
    }

    @Override
    public List<Long> getRemovedMembers(Long spaceId) {
        try {
            return memberRepository.getRemovedMembers(spaceId);
        } catch (Exception e) {
            throw new DatabaseOperationException(e.getMessage(),
                    "There is an error occurred in getRemovedMembers in MemberService by get " +
                            "-P %s".formatted(spaceId)
            );
        }
    }

}