package com.chami.backend.repositories;

import com.chami.backend.models.LearningPlan;
import com.chami.backend.models.LearningPlanEnrollment;
import com.chami.backend.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LearningPlanEnrollmentRepository extends JpaRepository<LearningPlanEnrollment, Long> {
    List<LearningPlanEnrollment> findByUser(User user);
    List<LearningPlanEnrollment> findByUserId(Long userId);
    List<LearningPlanEnrollment> findByLearningPlan(LearningPlan learningPlan);
    List<LearningPlanEnrollment> findByLearningPlanId(Long learningPlanId);
    Optional<LearningPlanEnrollment> findByLearningPlanIdAndUserId(Long learningPlanId, Long userId);
    
    // Count enrollments by learning plan
    Long countByLearningPlanId(Long learningPlanId);
}
