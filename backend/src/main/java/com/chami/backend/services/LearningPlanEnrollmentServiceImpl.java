package com.chami.backend.services;

import com.chami.backend.dtos.LearningPlanEnrollmentDTO;
import com.chami.backend.dtos.UserDTO;
import com.chami.backend.models.LearningPlan;
import com.chami.backend.models.LearningPlanEnrollment;
import com.chami.backend.models.User;
import com.chami.backend.repositories.LearningPlanEnrollmentRepository;
import com.chami.backend.repositories.LearningPlanRepository;
import com.chami.backend.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class LearningPlanEnrollmentServiceImpl implements LearningPlanEnrollmentService {

    @Autowired
    private LearningPlanEnrollmentRepository enrollmentRepository;

    @Autowired
    private LearningPlanRepository learningPlanRepository;

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private NotificationService notificationService;

    @Override
    @Transactional
    public LearningPlanEnrollmentDTO enrollInPlan(Long learningPlanId, Long userId) {
        // Verify learning plan exists and is public or shared
        LearningPlan learningPlan = learningPlanRepository.findById(learningPlanId)
                .orElseThrow(() -> new RuntimeException("Learning plan not found with id: " + learningPlanId));
        
        if (learningPlan.getVisibility() == LearningPlan.Visibility.PRIVATE && 
                !learningPlan.getUser().getId().equals(userId)) {
            throw new RuntimeException("You cannot enroll in a private learning plan");
        }
        
        // Check if user is already enrolled
        if (isUserEnrolled(learningPlanId, userId)) {
            throw new RuntimeException("User is already enrolled in this plan");
        }
        
        // Get user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with id: " + userId));
        
        // Create enrollment
        LearningPlanEnrollment enrollment = new LearningPlanEnrollment();
        enrollment.setLearningPlan(learningPlan);
        enrollment.setUser(user);
        enrollment.setEnrollmentDate(LocalDateTime.now());
        enrollment.setLastActivityDate(LocalDateTime.now());
        enrollment.setTotalTopics(learningPlan.getTopics().size());
        enrollment.setCompletedTopics(0);
        enrollment.setProgressPercentage(0);
        enrollment.setStatus(LearningPlanEnrollment.EnrollmentStatus.ACTIVE);
        
        // Save enrollment
        LearningPlanEnrollment savedEnrollment = enrollmentRepository.save(enrollment);
        
        // Update enrollment count in learning plan
        learningPlan.setEnrollmentCount(learningPlan.getEnrollmentCount() + 1);
        learningPlanRepository.save(learningPlan);
        
        // Send notification to the plan owner if the enrollee is not the plan owner
        Long planOwnerId = learningPlan.getUser().getId();
        if (!userId.equals(planOwnerId)) {
            notificationService.createEnrollmentNotification(userId, planOwnerId, learningPlanId);
        }
        
        return convertToDTO(savedEnrollment);
    }

    @Override
    @Transactional
    public void unenrollFromPlan(Long enrollmentId) {
        LearningPlanEnrollment enrollment = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new RuntimeException("Enrollment not found with id: " + enrollmentId));
        
        // Get learning plan to update enrollment count
        LearningPlan learningPlan = enrollment.getLearningPlan();
        
        // Delete enrollment
        enrollmentRepository.delete(enrollment);
        
        // Update enrollment count in learning plan
        learningPlan.setEnrollmentCount(Math.max(0, learningPlan.getEnrollmentCount() - 1));
        learningPlanRepository.save(learningPlan);
    }

    @Override
    @Transactional
    public LearningPlanEnrollmentDTO updateProgress(Long enrollmentId, Integer completedTopics) {
        LearningPlanEnrollment enrollment = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new RuntimeException("Enrollment not found with id: " + enrollmentId));
        
        enrollment.setCompletedTopics(completedTopics);
        enrollment.updateProgress();
        
        // Update status if all topics are completed
        if (enrollment.getProgressPercentage() == 100) {
            enrollment.setStatus(LearningPlanEnrollment.EnrollmentStatus.COMPLETED);
        }
        
        LearningPlanEnrollment updatedEnrollment = enrollmentRepository.save(enrollment);
        return convertToDTO(updatedEnrollment);
    }

    @Override
    public LearningPlanEnrollmentDTO getEnrollmentById(Long enrollmentId) {
        LearningPlanEnrollment enrollment = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new RuntimeException("Enrollment not found with id: " + enrollmentId));
        
        return convertToDTO(enrollment);
    }

    @Override
    public LearningPlanEnrollmentDTO getEnrollmentByPlanAndUser(Long planId, Long userId) {
        LearningPlanEnrollment enrollment = enrollmentRepository.findByLearningPlanIdAndUserId(planId, userId)
                .orElseThrow(() -> new RuntimeException("Enrollment not found for plan: " + planId + " and user: " + userId));
        
        return convertToDTO(enrollment);
    }

    @Override
    public List<LearningPlanEnrollmentDTO> getEnrollmentsByUserId(Long userId) {
        List<LearningPlanEnrollment> enrollments = enrollmentRepository.findByUserId(userId);
        
        return enrollments.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<LearningPlanEnrollmentDTO> getEnrollmentsByPlanId(Long planId) {
        List<LearningPlanEnrollment> enrollments = enrollmentRepository.findByLearningPlanId(planId);
        
        return enrollments.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public boolean isUserEnrolled(Long planId, Long userId) {
        return enrollmentRepository.findByLearningPlanIdAndUserId(planId, userId).isPresent();
    }
    
    private LearningPlanEnrollmentDTO convertToDTO(LearningPlanEnrollment entity) {
        LearningPlanEnrollmentDTO dto = new LearningPlanEnrollmentDTO();
        
        dto.setId(entity.getId());
        dto.setLearningPlanId(entity.getLearningPlan().getId());
        dto.setEnrollmentDate(entity.getEnrollmentDate());
        dto.setCompletedTopics(entity.getCompletedTopics());
        dto.setTotalTopics(entity.getTotalTopics());
        dto.setProgressPercentage(entity.getProgressPercentage());
        dto.setLastActivityDate(entity.getLastActivityDate());
        dto.setStatus(entity.getStatus());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        
        // Set user
        if (entity.getUser() != null) {
            UserDTO userDTO = new UserDTO();
            userDTO.setId(entity.getUser().getId());
            userDTO.setUsername(entity.getUser().getUsername());
            dto.setUser(userDTO);
        }
        
        return dto;
    }
}
