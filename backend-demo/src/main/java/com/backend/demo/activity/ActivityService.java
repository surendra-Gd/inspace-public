package com.backend.demo.activity;

import com.backend.demo.common.PageResponse;
import com.backend.demo.dto.ActivityDTO;
import com.backend.demo.user.User;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

public interface ActivityService {


    Long addActivity(Long spaceId, User user, Prompt promptType);

    PageResponse<ActivityDTO> getActivitiesBySpaceId(Long spaceId, int page);

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    void deleteAllBySpaceId(Long spaceId);
}
