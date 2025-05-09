package com.chami.backend.controllers;

import com.chami.backend.dtos.LearningPlanEnrollmentDTO;
import com.chami.backend.security.services.UserDetailsImpl;
import com.chami.backend.services.LearningPlanEnrollmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/plan-enrollments")
public class LearningPlanEnrollmentController {

    @Autowired
    private LearningPlanEnrollmentService enrollmentService;

    @PostMapping("/enroll/{planId}")
    @PreAuthorize("hasRole('USER') or hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<LearningPlanEnrollmentDTO> enrollInPlan(@PathVariable Long planId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        LearningPlanEnrollmentDTO enrollment = enrollmentService.enrollInPlan(planId, userDetails.getId());
        return ResponseEntity.ok(enrollment);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('USER') or hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<?> unenrollFromPlan(@PathVariable Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        // Get enrollment to verify ownership
        LearningPlanEnrollmentDTO enrollment = enrollmentService.getEnrollmentById(id);
        
        // Verify ownership or admin access
        if (enrollment.getUser().getId().equals(userDetails.getId()) || 
            userDetails.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            
            enrollmentService.unenrollFromPlan(id);
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.status(403).build(); // Forbidden
        }
    }

    @PatchMapping("/{id}/progress")
    @PreAuthorize("hasRole('USER') or hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<LearningPlanEnrollmentDTO> updateProgress(
            @PathVariable Long id, 
            @RequestBody Map<String, Integer> progressUpdate) {
        
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        // Get enrollment to verify ownership
        LearningPlanEnrollmentDTO enrollment = enrollmentService.getEnrollmentById(id);
        
        // Verify ownership or admin access
        if (enrollment.getUser().getId().equals(userDetails.getId()) || 
            userDetails.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            
            Integer completedTopics = progressUpdate.get("completedTopics");
            LearningPlanEnrollmentDTO updatedEnrollment = enrollmentService.updateProgress(id, completedTopics);
            return ResponseEntity.ok(updatedEnrollment);
        } else {
            return ResponseEntity.status(403).build(); // Forbidden
        }
    }

    @GetMapping("/user")
    @PreAuthorize("hasRole('USER') or hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<List<LearningPlanEnrollmentDTO>> getCurrentUserEnrollments() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        List<LearningPlanEnrollmentDTO> enrollments = enrollmentService.getEnrollmentsByUserId(userDetails.getId());
        return ResponseEntity.ok(enrollments);
    }

    @GetMapping("/plan/{planId}")
    @PreAuthorize("hasRole('USER') or hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<List<LearningPlanEnrollmentDTO>> getEnrollmentsByPlanId(@PathVariable Long planId) {
        List<LearningPlanEnrollmentDTO> enrollments = enrollmentService.getEnrollmentsByPlanId(planId);
        return ResponseEntity.ok(enrollments);
    }

    @GetMapping("/status/{planId}")
    @PreAuthorize("hasRole('USER') or hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<Boolean> isUserEnrolled(@PathVariable Long planId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        boolean isEnrolled = enrollmentService.isUserEnrolled(planId, userDetails.getId());
        return ResponseEntity.ok(isEnrolled);
    }
}
