package com.backend.demo.user;

import com.backend.demo.dto.UserDTO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {

    List<User> findAllByUsernameStartingWithIgnoreCase(String username);

    @Query("SELECT u FROM User u WHERE u.username = :username AND u.enabled = TRUE")
    Optional<User> findNonExpiredUserByUsername(String username);

    // Tested.
    @Query("SELECT new com.backend.demo.dto.UserDTO(u.userId, u.username, " +
            "u.name, u.profileUrl, u.status) FROM User u " +
            "WHERE u.username = :username AND u.enabled = TRUE ")
    Optional<UserDTO> getUserDtoByUsername(@Param("username") String username);

    Optional<User> findByUsername(String username);

    @Transactional
    @Modifying
    @Query("UPDATE User u " +
            "SET u.enabled = TRUE WHERE u.email = :email")
    void enableUser(@Param("email") String email);


    Optional<User> findByEmail(String email);

    /** Get User by userId for user retrieval **/
    Optional<User> findByUserId(Long userId);


    /** Checking the email exists for email operations. **/
    // Todo: Indexing.
    boolean existsByEmail(String email);

    /** Checking the username availability **/
    // Todo: Indexing.
    boolean existsByUsername(String username);


    /** object key checking for avoid conflicts on profile url. **/
    // Todo: Indexing.
    boolean existsByObjectKey(String key);

    @Transactional
    @Modifying
    @Query("UPDATE User u " +
            "SET u.password = :password WHERE u.userId = :userId")
    void updatePassword(@Param("userId") Long userId, @Param("password") String password);
}