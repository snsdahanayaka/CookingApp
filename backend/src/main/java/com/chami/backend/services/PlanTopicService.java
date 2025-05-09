package com.chami.backend.services;

import com.chami.backend.dtos.PlanTopicDTO;
import com.chami.backend.models.PlanTopic.TopicStatus;

import java.util.List;

public interface PlanTopicService {
    PlanTopicDTO createPlanTopic(PlanTopicDTO planTopicDTO, Long learningPlanId);
    PlanTopicDTO updatePlanTopic(Long id, PlanTopicDTO planTopicDTO);
    PlanTopicDTO updateTopicStatus(Long id, TopicStatus status);
    void deletePlanTopic(Long id);
    PlanTopicDTO getPlanTopicById(Long id);
    List<PlanTopicDTO> getPlanTopicsByLearningPlanId(Long learningPlanId);
}
