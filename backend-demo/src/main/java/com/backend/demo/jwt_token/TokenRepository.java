package com.backend.demo.jwt_token;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TokenRepository
        extends JpaRepository<Token, Long> {

    @Query("""
    select t from Token t inner join User u on t.user.userId = u.userId
    where u.userId = :userId and (t.expired = false or t.revoked = false)
""")
    List<Token> findAllValidTokensByUser(@Param("userId") Long userId);


    Optional<Token> findByAccessToken(String token);

    @Query("select case when count(t) > 0 then true else false END from Token t " +
            "where t.accessToken = :token and t.expired = false and t.revoked = false")
    boolean isValidToken(@Param("token") String token);

}