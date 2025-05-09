package com.chami.backend.repositories;

import com.chami.backend.models.LearningPlan;
import com.chami.backend.models.LearningPlan.Visibility;
import com.chami.backend.models.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LearningPlanRepository extends JpaRepository<LearningPlan, Long> {
    List<LearningPlan> findByUser(User user);
    List<LearningPlan> findByUserId(Long userId);
    
    // Find public learning plans
    List<LearningPlan> findByVisibility(Visibility visibility);
    Page<LearningPlan> findByVisibility(Visibility visibility, Pageable pageable);
    
    // Search plans by title, description or tags
    @Query("SELECT lp FROM LearningPlan lp WHERE lp.visibility = :visibility AND "
           + "(LOWER(lp.title) LIKE LOWER(CONCAT('%', :query, '%')) OR "
           + "LOWER(lp.description) LIKE LOWER(CONCAT('%', :query, '%')) OR "
           + "LOWER(lp.tags) LIKE LOWER(CONCAT('%', :query, '%')))")  
    Page<LearningPlan> searchPublicPlans(
        @Param("visibility") Visibility visibility,
        @Param("query") String query, 
        Pageable pageable
    );
    
    // Find popular plans with highest enrollment count
    Page<LearningPlan> findByVisibilityOrderByEnrollmentCountDesc(Visibility visibility, Pageable pageable);
    
    // Find recent plans
    Page<LearningPlan> findByVisibilityOrderByCreatedAtDesc(Visibility visibility, Pageable pageable);
}
