package com.chami.backend.services;

import com.chami.backend.dtos.LearningPlanDTO;
import com.chami.backend.models.LearningPlan.Visibility;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface LearningPlanService {
    // Basic CRUD operations
    LearningPlanDTO createLearningPlan(LearningPlanDTO learningPlanDTO);
    LearningPlanDTO updateLearningPlan(Long id, LearningPlanDTO learningPlanDTO);
    void deleteLearningPlan(Long id);
    LearningPlanDTO getLearningPlanById(Long id);
    LearningPlanDTO getLearningPlanByIdWithUserContext(Long id, Long currentUserId);
    List<LearningPlanDTO> getLearningPlansByUserId(Long userId);
    
    // Social features
    Page<LearningPlanDTO> getPublicLearningPlans(Pageable pageable);
    Page<LearningPlanDTO> searchPublicPlans(String query, Pageable pageable);
    Page<LearningPlanDTO> getPopularLearningPlans(Pageable pageable);
    Page<LearningPlanDTO> getRecentLearningPlans(Pageable pageable);
    
    // Visibility management
    LearningPlanDTO updateVisibility(Long id, Visibility visibility);
    void incrementViewCount(Long id);
}
