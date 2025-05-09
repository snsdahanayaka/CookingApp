package com.chami.backend.services;

import com.chami.backend.dtos.LearningPlanEnrollmentDTO;

import java.util.List;

public interface LearningPlanEnrollmentService {
    LearningPlanEnrollmentDTO enrollInPlan(Long learningPlanId, Long userId);
    void unenrollFromPlan(Long enrollmentId);
    LearningPlanEnrollmentDTO updateProgress(Long enrollmentId, Integer completedTopics);
    LearningPlanEnrollmentDTO getEnrollmentById(Long enrollmentId);
    LearningPlanEnrollmentDTO getEnrollmentByPlanAndUser(Long planId, Long userId);
    List<LearningPlanEnrollmentDTO> getEnrollmentsByUserId(Long userId);
    List<LearningPlanEnrollmentDTO> getEnrollmentsByPlanId(Long planId);
    boolean isUserEnrolled(Long planId, Long userId);
}
