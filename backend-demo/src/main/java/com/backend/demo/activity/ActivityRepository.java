package com.backend.demo.activity;

import com.backend.demo.dto.ActivityDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface ActivityRepository extends JpaRepository<Activity, Long> {

    @Query("SELECT new com.backend.demo.dto.ActivityDTO(a.id, a._user.userId, " +
            "a._user.username, a._user.name, a._user.profileUrl, a._user.status, " +
            "a.prompt, a.timeStamp) FROM Activity a WHERE a.spaceId = :spaceId")
    Page<ActivityDTO> findAllBySpaceId(Long spaceId, Pageable pageable);

    @Transactional
    @Modifying
    void deleteActivitiesBySpaceId(Long spaceId);
}