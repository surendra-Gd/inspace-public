package com.backend.demo.spacerequest;

import com.backend.demo.dto.SpaceRequestDTO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;


import java.util.List;
import java.util.Optional;

@Repository
public interface SpaceRequestRepository extends JpaRepository<SpaceRequest, Long> {

    // A Lot of logic can be applied on this query.
    // Tested.
    Optional<SpaceRequest> findByRequestId(Long requestId);


    @Query("SELECT r.requestId FROM SpaceRequest r WHERE r.requestedBy.userId = :userId " +
            "AND r.space.spaceId = :spaceId AND r.status = 'PROCESS'")
    Optional<Long> getRequestByUserIdAndSpaceId(
            @Param("userId") Long userId, @Param("spaceId") Long spaceId
    );

    @Query( "SELECT new com.backend.demo.dto.SpaceRequestDTO(r.requestId, r.status, " +
            "r.requestedOn, r.requestedBy.userId, r.requestedBy.username, r.requestedBy.name, " +
            "r.requestedBy.profileUrl, r.requestedBy.status, r.adminSeen) FROM SpaceRequest r " +
            "WHERE r.space.spaceId = :spaceId AND r.status = 'PROCESS'")
    List<SpaceRequestDTO> getProcessedRequestsBySpaceId(@Param("spaceId") Long spaceId);

    @Query("SELECT r.requestId FROM SpaceRequest r WHERE r.space.spaceId = :spaceId " +
            "AND r.requestedBy.userId = :userId AND r.status = 'PROCESS'")
    Optional<Long> getProcessedRequest(
            @Param("userId") Long userId, @Param("spaceId") Long spaceId
    );

    @Transactional
    void deleteByRequestId(Long requestId);

    @Query("SELECT COUNT(r) FROM SpaceRequest r " +
            "WHERE r.space.spaceId=:spaceId AND r.adminSeen=false ")
    int getUnseenRequestsCount(@Param("spaceId") Long spaceId);

    @Modifying
    @Query("UPDATE SpaceRequest r SET r.adminSeen = true " +
            "WHERE r.space.spaceId = :spaceId")
    void updateUnseenRequests(Long spaceId);

}