package com.backend.demo.activity;

import com.backend.demo.common.PageResponse;
import com.backend.demo.dto.ActivityDTO;
import com.backend.demo.exception.DatabaseOperationException;
import com.backend.demo.user.User;
import lombok.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;


import java.time.LocalDateTime;
import java.util.List;


@Service
@RequiredArgsConstructor
public class ActivityServiceImpl implements ActivityService {

    private final ActivityRepository activityRepository;


    @Override
    public Long addActivity(Long spaceId, User user, Prompt promptType) {
        Activity newActivity = Activity.builder()
                ._user(user)
                .spaceId(spaceId)
                .prompt(promptType)
                .timeStamp(LocalDateTime.now())
                .build();
        try {
            return activityRepository.save(newActivity).getId();
        } catch (Exception e) {
            throw new DatabaseOperationException(e.getMessage(),
                    "There is a error on addActivity in ActivityService on save operation -P %s".formatted(newActivity.toString())
            );
        }
    }


    @Override
    public PageResponse<ActivityDTO> getActivitiesBySpaceId(Long spaceId, int page) {
        PageRequest pageRequest = PageRequest.of(page, 10, Sort.by("timeStamp").descending());

        try {
            Page<ActivityDTO> activities = activityRepository.findAllBySpaceId(spaceId, pageRequest);
            List<ActivityDTO> response = activities.getContent();
            return new PageResponse<>(
                    response,
                    activities.getNumber(),
                    activities.getTotalElements(),
                    activities.getTotalPages(),
                    activities.isFirst(),
                    activities.isLast(),
                    activities.hasNext(),
                    activities.hasPrevious()
            );
        } catch (Exception e) {
            throw new DatabaseOperationException(e.getMessage(),
                    ("There is an error occurred on getActivitiesBySpaceId in ActivityService " +
                            "on get operation -P %s, %s").formatted(spaceId, pageRequest.toString())
            );
        }
    }

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void deleteAllBySpaceId(Long spaceId) {
        try {
            activityRepository.deleteActivitiesBySpaceId(spaceId);
        } catch(Exception e) {
            throw new DatabaseOperationException(e.getMessage(),
                    "There is an error occurred on deleteAllBySpaceId on ActivityService in delete " +
                            "Operation -P %s".formatted(spaceId)
            );
        }
    }
}