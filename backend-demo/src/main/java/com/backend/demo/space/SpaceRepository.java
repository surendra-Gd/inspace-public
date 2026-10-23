package com.backend.demo.space;

import com.backend.demo.dto.SpaceDTO;
import com.backend.demo.projections.SpaceInfoProjection;
import com.backend.demo.projections.SpaceProjection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;


@Repository
public interface SpaceRepository extends JpaRepository<Space, Long> {


    Optional<Space> findBySpaceId(Long spaceId);

    @Query("SELECT new com.backend.demo.projections.SpaceProjection(s.spaceId, s.spacename, s.admin.userId) " +
            "FROM space s WHERE s.spaceId = :spaceId")
    Optional<SpaceProjection> findSpaceDTOById(@Param("spaceId") Long spaceId);

    @Query("SELECT new com.backend.demo.projections.SpaceInfoProjection(s.spaceId, s.spacename, s.uniqueId, " +
            "s.admin.userId, s.admin.username, s.admin.name, s.admin.profileUrl, s.admin.status) " +
            "FROM space s WHERE s.spaceId = :spaceId")
    Optional<SpaceInfoProjection> findSpaceInfoBySpaceId(@Param("spaceId") Long spaceId);

    Optional<SpaceDTO> findByUniqueId(String uniqueId);

    boolean existsByUniqueId(String uniqueId);

    @Modifying
    @Query("UPDATE space s SET s.spacename = :spaceName WHERE s.spaceId = :spaceId")
    void updateSpaceName(@Param("spaceId") Long spaceId, @Param("spaceName") String spaceName);

    @Transactional
    void deleteSpaceBySpaceId(Long spaceId);

    @Query("SELECT s.uniqueId FROM space s WHERE s.spaceId = :spaceId")
    String getUniqueIdBySpaceId(@Param("spaceId") Long spaceId);

}
