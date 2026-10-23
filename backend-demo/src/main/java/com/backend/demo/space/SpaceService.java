package com.backend.demo.space;

import com.backend.demo.dto.AdminActionResponse;
import com.backend.demo.dto.CreateSpaceRequest;
import com.backend.demo.dto.CurrentUserSpaceDTO;
import com.backend.demo.projections.SpaceTokenProjection;
import com.backend.demo.user.User;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface SpaceService {

    @Transactional
    CurrentUserSpaceDTO createSpace(CreateSpaceRequest request);

    AdminActionResponse acceptTheMember(User user, Space space);

    // show space for join
    ResponseEntity<?> getSpaceForJoin(String uniqueId);

    ResponseEntity<?> getCurrentUserSpaces();

    @Modifying
    String updateSpacename(Long spaceId, String spacename);

    Space getSpaceById(Long spaceId);

    @Transactional
    ResponseEntity<?> deleteSpace(Long spaceId, String feedback);

    @Transactional
    void leaveSpace(Long memberId, Long spaceId, String feedback);

    // Todo: use cache.
    @Transactional
    ResponseEntity<?> removeMember(Long targetId, Long spaceId, String feedback);

    @Transactional
    void shiftAdmin(Long targetMember, Long memberId, Long spaceId);

    List<SpaceTokenProjection> getCurrentSpaceMembers();

    List<SpaceTokenProjection> getCurrentSpaceMembersByUser(Long userId);

    List<Long> getSpaceIdsByUser(Long userId);
}
