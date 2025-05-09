package com.chami.backend.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "plan_topics")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PlanTopic {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(name = "material_link", columnDefinition = "TEXT")
    private String materialLink;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TopicStatus status = TopicStatus.NOT_STARTED;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "learning_plan_id")
    private LearningPlan learningPlan;

    @Column(name = "order_index")
    private Integer orderIndex;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Enum for topic status
    public enum TopicStatus {
        NOT_STARTED,
        IN_PROGRESS,
        COMPLETED
    }
}
