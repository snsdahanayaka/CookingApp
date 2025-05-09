package com.chami.backend.repositories;

import com.chami.backend.models.LearningPlan;
import com.chami.backend.models.PlanTopic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlanTopicRepository extends JpaRepository<PlanTopic, Long> {
    List<PlanTopic> findByLearningPlan(LearningPlan learningPlan);
    List<PlanTopic> findByLearningPlanIdOrderByOrderIndexAsc(Long learningPlanId);
}
