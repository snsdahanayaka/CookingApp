package com.chami.backend.dtos;

import com.chami.backend.models.PlanTopic.TopicStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PlanTopicDTO {
    private Long id;
    private String title;
    private String materialLink;
    private TopicStatus status;
    private String notes;
    private Integer orderIndex;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
