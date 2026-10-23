package com.backend.demo.member;

import com.backend.demo.projections.SpaceCardProjection;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.http.ResponseEntity;

import java.util.List;

public interface MemberService {
    ResponseEntity<?> getAllMembersBySpaceId(Long spaceId);

    // get member for InSpace page
    // Todo: not necessary to return member just return 403 then join space will get space by uniqueId came from state of useLocation
    ResponseEntity<?> getMemberBySpaceId(Long spaceId);


    boolean existsByMember(Long memberId, Long spaceId);

    // get spaces by user id in spaces page
    List<SpaceCardProjection> getSpaceByMemberUserId(Long userId);

    // get members count in space for deletion
    ResponseEntity<?> getMembersCountById(Long spaceId);

    Long getMemberCount(Long spaceId);

    // check the user is member of space or not
    Long isUserAsMember(Long userId, Long spaceId);

    SpaceMember getByMemberId(Long memberId);

    void removeMemberById(Long memberId);

    @Modifying
    void updateMemberTypes(SpaceMember member, SpaceMember admin);

    ResponseEntity<?> getMemberById(
            Long targetMemberId, Long spaceId
    );

    List<Long> getRemovedMembers(Long spaceId);

}
