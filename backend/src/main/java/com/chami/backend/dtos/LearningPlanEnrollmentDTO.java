package com.chami.backend.dtos;

import com.chami.backend.models.LearningPlanEnrollment.EnrollmentStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LearningPlanEnrollmentDTO {
    private Long id;
    private Long learningPlanId;
    private UserDTO user;
    private LocalDateTime enrollmentDate;
    private Integer completedTopics;
    private Integer totalTopics;
    private Integer progressPercentage;
    private LocalDateTime lastActivityDate;
    private EnrollmentStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
