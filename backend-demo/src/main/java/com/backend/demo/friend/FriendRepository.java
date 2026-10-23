package com.backend.demo.friend;

import com.backend.demo.dto.UserDTO;
import com.backend.demo.projections.UserFriendIds;
import com.backend.demo.user.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface FriendRepository extends JpaRepository<Friend, Long> {


    @Query("SELECT new com.backend.demo.dto.UserDTO(" +
            "u2.userId, u2.username, u2.name, u2.profileUrl, u2.status) FROM User u1 " +
            "JOIN Friend f ON (f.user1.userId = u1.userId OR f.user2.userId = u1.userId) " +
            "JOIN User u2 ON (u2.userId = f.user1.userId OR u2.userId = f.user2.userId) " +
            "WHERE u1.userId = :userId ORDER BY f.friendsId DESC ")
    List<UserDTO> findFriendUsersByUserId(@Param("userId") Long userId);


    @Query("SELECT f.friendsId FROM Friend f " +
            "WHERE (f.user1.userId = :user1 AND f.user2.userId = :user2) OR " +
            "(f.user1.userId = :user2 AND f.user2.userId = :user1)")
    Optional<Long> getFriendsIdByUserId(
            @Param("user1") Long user1, @Param("user2") Long user2
    );

    // expensive query.
    @Query("SELECT DISTINCT u3 FROM User u1 " +
            "JOIN Friend f ON (f.user1.userId = u1.userId OR f.user2.userId = u1.userId) " +
            "JOIN User u2 ON (u2.userId = f.user1.userId OR u2.userId = f.user2.userId) " +
            "JOIN Friend ff ON (ff.user1.userId = u2.userId OR ff.user2.userId = u2.userId) " +
            "JOIN User u3 ON (u3.userId = ff.user1.userId OR u3.userId = ff.user2.userId) " +
            "WHERE u1.userId = :currentUser " +
            "AND u3.userId != u1.userId AND u3.enabled " +
            "AND u3.userId NOT IN (" +
            "SELECT CASE " +
            "WHEN f.user1.userId = :currentUser THEN f.user2.userId " +
            "ELSE f.user1.userId END " +
            "FROM Friend f " +
            "WHERE f.user1.userId = :currentUser OR f.user2.userId = :currentUser) " +
            "ORDER BY u3.userId DESC"
    )
    Page<User> findFriendsOfFriends(@Param("currentUser") Long userId, Pageable pageable);

    @Transactional
    void deleteByFriendsId(Long friendsId);

    @Query("SELECT new com.backend.demo.projections.UserFriendIds(f.user1.userId, f.user2.userId) " +
            "FROM Friend f WHERE f.friendsId = :friendsId")
    Optional<UserFriendIds> findByFriendsId(@Param("friendsId") Long friendsId);
}