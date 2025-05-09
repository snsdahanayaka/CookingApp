package com.chami.backend.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "learning_plans")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LearningPlan {
    
    public enum Visibility {
        PRIVATE,   // Only visible to creator
        PUBLIC,    // Visible to all users
        SHARED     // Visible to specific users (via enrollments)
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @OneToMany(mappedBy = "learningPlan", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<PlanTopic> topics = new HashSet<>();
    
    @OneToMany(mappedBy = "learningPlan", cascade = CascadeType.ALL)
    private Set<LearningPlanEnrollment> enrollments = new HashSet<>();

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Visibility visibility = Visibility.PRIVATE;
    
    @Column(name = "enrollment_count")
    private Integer enrollmentCount = 0;
    
    @Column(name = "view_count")
    private Integer viewCount = 0;
    
    @Column(columnDefinition = "TEXT")
    private String tags;

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

    // Helper method to add a topic
    public void addTopic(PlanTopic topic) {
        topics.add(topic);
        topic.setLearningPlan(this);
    }

    // Helper method to remove a topic
    public void removeTopic(PlanTopic topic) {
        topics.remove(topic);
        topic.setLearningPlan(null);
    }
}
