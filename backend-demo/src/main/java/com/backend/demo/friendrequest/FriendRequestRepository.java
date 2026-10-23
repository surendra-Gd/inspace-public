package com.backend.demo.friendrequest;

import com.backend.demo.dto.FriendRequestDTO;
import com.backend.demo.projections.FriendRequestIdProjection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FriendRequestRepository extends JpaRepository<FriendRequest, Long> {

    // Todo: Look after some time.
    Optional<FriendRequest> findByRequestId(Long friendRequestId);


    @Query("SELECT new com.backend.demo.projections.FriendRequestIdProjection(f.requestId, f.requester.userId) " +
            "FROM FriendRequest f WHERE " +
            "(f.requester.userId = :user1 AND f.requestTo.userId = :user2 AND f.status = 'PROCESS') " +
            "OR (f.requester.userId = :user2 AND f.requestTo.userId = :user1 AND f.status = 'PROCESS')")
    Optional<FriendRequestIdProjection> findRequestsByBothUsers(
            @Param("user1") Long user1, @Param("user2") Long user2
    );


    @Query("SELECT new com.backend.demo.dto.FriendRequestDTO(f.requestId, f.requester.userId, " +
            "f.requester.username, f.requester.name, f.requester.profileUrl, f.requester.status, f.targetUserSeen) " +
            "FROM FriendRequest f WHERE f.requestTo.userId = :userId AND f.status = 'PROCESS' " +
            "ORDER BY f.requestId DESC ")
    List<FriendRequestDTO> getAllIncomingRequestsByUserId(@Param("userId") Long userId);



    @Query("SELECT new com.backend.demo.dto.FriendRequestDTO(f.requestId, f.requestTo.userId, " +
            "f.requestTo.username, f.requestTo.name, f.requestTo.profileUrl, f.requestTo.status, f.targetUserSeen) " +
            "FROM FriendRequest f WHERE f.requester.userId = :userId AND f.status = 'PROCESS' " +
            "ORDER BY f.requestId DESC ")
    List<FriendRequestDTO> getAllOutgoingRequestsByUserId(@Param("userId") Long userId);


    @Query("SELECT f.requestId FROM FriendRequest f WHERE f.requester.userId = :requester " +
            "AND f.requestTo.userId = :requestTo AND f.status = 'PROCESS'")
    Optional<Long> findRequestsByIds(
            @Param("requester") Long requester, @Param("requestTo") Long requestTo
    );

    @Modifying
    @Query("UPDATE FriendRequest f SET f.targetUserSeen=true " +
            "WHERE f.requestTo.userId = :userId AND f.targetUserSeen=false")
    void setViewOnUnseenIncomingRequests(@Param("userId") Long userId);
}