package com.backend.demo.email.email_token;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;


import java.util.List;
import java.util.Optional;

@Repository
@Transactional(readOnly = true)
public interface ConfirmationTokenRepository
        extends JpaRepository<ConfirmationToken, Long> {

    Optional<ConfirmationToken> findByToken(String token);



    @Transactional
    @Modifying
    @Query("UPDATE ConfirmationToken c " +
            "SET c.validated = true, c.revoked = true " +
            "WHERE c.token = :token")
    void updateValidatedAt(@Param("token") String token);

    @Query("""
    select t from ConfirmationToken t inner join User u on t.user.userId = u.userId
    where u.userId = :userId and t.revoked = false
    """)
    List<ConfirmationToken> findAllValidateTokensByUser(@Param("userId") Long userId);
}