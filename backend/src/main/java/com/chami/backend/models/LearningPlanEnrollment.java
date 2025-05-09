package com.chami.backend.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "learning_plan_enrollments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LearningPlanEnrollment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "learning_plan_id", nullable = false)
    private LearningPlan learningPlan;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "enrollment_date", nullable = false)
    private LocalDateTime enrollmentDate;

    @Column(name = "completed_topics")
    private Integer completedTopics = 0;
    
    @Column(name = "total_topics")
    private Integer totalTopics = 0;
    
    @Column(name = "progress_percentage")
    private Integer progressPercentage = 0;
    
    @Column(name = "last_activity_date")
    private LocalDateTime lastActivityDate;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EnrollmentStatus status = EnrollmentStatus.ACTIVE;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.enrollmentDate = LocalDateTime.now();
        this.lastActivityDate = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
    
    // Calculate progress
    public void updateProgress() {
        if (totalTopics > 0) {
            this.progressPercentage = (int) Math.round((completedTopics * 100.0) / totalTopics);
        } else {
            this.progressPercentage = 0;
        }
        this.lastActivityDate = LocalDateTime.now();
    }
    
    public enum EnrollmentStatus {
        ACTIVE,
        COMPLETED,
        ABANDONED
    }
}
