package com.chami.backend.dtos;

import com.chami.backend.models.LearningPlan.Visibility;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LearningPlanDTO {
    private Long id;
    private String title;
    private String description;
    private UserDTO user;
    private Set<PlanTopicDTO> topics = new HashSet<>();
    private LocalDate startDate;
    private LocalDate endDate;
    private Visibility visibility;
    private Integer enrollmentCount;
    private Integer viewCount;
    private String tags;
    private Boolean isEnrolled;
    private List<LearningPlanEnrollmentDTO> participants;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
