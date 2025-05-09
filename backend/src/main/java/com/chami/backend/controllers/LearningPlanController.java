package com.chami.backend.controllers;

import com.chami.backend.dtos.LearningPlanDTO;
import com.chami.backend.dtos.UserDTO;
import com.chami.backend.models.LearningPlan.Visibility;
import com.chami.backend.security.services.UserDetailsImpl;
import com.chami.backend.services.LearningPlanService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/learning-plans")
public class LearningPlanController {

    @Autowired
    private LearningPlanService learningPlanService;

    @GetMapping
    @PreAuthorize("hasRole('USER') or hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<List<LearningPlanDTO>> getCurrentUserLearningPlans() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        List<LearningPlanDTO> learningPlans = learningPlanService.getLearningPlansByUserId(userDetails.getId());
        return ResponseEntity.ok(learningPlans);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('USER') or hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<LearningPlanDTO> getLearningPlanById(@PathVariable Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        // Get the plan with user context to check enrollment and track views
        LearningPlanDTO learningPlan = learningPlanService.getLearningPlanByIdWithUserContext(id, userDetails.getId());
        return ResponseEntity.ok(learningPlan);
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('USER') or hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<List<LearningPlanDTO>> getLearningPlansByUserId(@PathVariable Long userId) {
        List<LearningPlanDTO> learningPlans = learningPlanService.getLearningPlansByUserId(userId);
        return ResponseEntity.ok(learningPlans);
    }

    @PostMapping
    @PreAuthorize("hasRole('USER') or hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<LearningPlanDTO> createLearningPlan(@RequestBody LearningPlanDTO learningPlanDTO) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        // Set the current user as the creator
        UserDTO userDTO = new UserDTO();
        userDTO.setId(userDetails.getId());
        learningPlanDTO.setUser(userDTO);
        
        LearningPlanDTO createdPlan = learningPlanService.createLearningPlan(learningPlanDTO);
        return ResponseEntity.ok(createdPlan);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('USER') or hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<LearningPlanDTO> updateLearningPlan(@PathVariable Long id, @RequestBody LearningPlanDTO learningPlanDTO) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        // Verify ownership or admin access
        LearningPlanDTO existingPlan = learningPlanService.getLearningPlanById(id);
        if (existingPlan.getUser().getId().equals(userDetails.getId()) || 
            userDetails.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            
            LearningPlanDTO updatedPlan = learningPlanService.updateLearningPlan(id, learningPlanDTO);
            return ResponseEntity.ok(updatedPlan);
        } else {
            return ResponseEntity.status(403).build(); // Forbidden
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('USER') or hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<?> deleteLearningPlan(@PathVariable Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        // Verify ownership or admin access
        LearningPlanDTO existingPlan = learningPlanService.getLearningPlanById(id);
        if (existingPlan.getUser().getId().equals(userDetails.getId()) || 
            userDetails.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            
            learningPlanService.deleteLearningPlan(id);
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.status(403).build(); // Forbidden
        }
    }
    
    // Social discovery endpoints
    
    @GetMapping("/discover/public")
    public ResponseEntity<Page<LearningPlanDTO>> getPublicLearningPlans(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<LearningPlanDTO> publicPlans = learningPlanService.getPublicLearningPlans(pageable);
        return ResponseEntity.ok(publicPlans);
    }
    
    @GetMapping("/discover/search")
    public ResponseEntity<Page<LearningPlanDTO>> searchPublicPlans(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<LearningPlanDTO> searchResults = learningPlanService.searchPublicPlans(query, pageable);
        return ResponseEntity.ok(searchResults);
    }
    
    @GetMapping("/discover/popular")
    public ResponseEntity<Page<LearningPlanDTO>> getPopularLearningPlans(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<LearningPlanDTO> popularPlans = learningPlanService.getPopularLearningPlans(pageable);
        return ResponseEntity.ok(popularPlans);
    }
    
    @GetMapping("/discover/recent")
    public ResponseEntity<Page<LearningPlanDTO>> getRecentLearningPlans(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<LearningPlanDTO> recentPlans = learningPlanService.getRecentLearningPlans(pageable);
        return ResponseEntity.ok(recentPlans);
    }
    
    @PatchMapping("/{id}/visibility")
    @PreAuthorize("hasRole('USER') or hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<LearningPlanDTO> updateVisibility(
            @PathVariable Long id,
            @RequestBody Map<String, String> visibilityUpdate) {
        
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        // Verify ownership or admin access
        LearningPlanDTO existingPlan = learningPlanService.getLearningPlanById(id);
        if (existingPlan.getUser().getId().equals(userDetails.getId()) || 
            userDetails.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            
            Visibility visibility = Visibility.valueOf(visibilityUpdate.get("visibility"));
            LearningPlanDTO updatedPlan = learningPlanService.updateVisibility(id, visibility);
            return ResponseEntity.ok(updatedPlan);
        } else {
            return ResponseEntity.status(403).build(); // Forbidden
        }
    }
}
