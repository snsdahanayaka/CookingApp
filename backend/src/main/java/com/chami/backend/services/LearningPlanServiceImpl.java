package com.chami.backend.services;

import com.chami.backend.dtos.LearningPlanDTO;
import com.chami.backend.dtos.LearningPlanEnrollmentDTO;
import com.chami.backend.dtos.PlanTopicDTO;
import com.chami.backend.dtos.UserDTO;
import com.chami.backend.models.LearningPlan;
import com.chami.backend.models.LearningPlan.Visibility;
import com.chami.backend.models.PlanTopic;
import com.chami.backend.models.User;

import com.chami.backend.repositories.LearningPlanRepository;
import com.chami.backend.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class LearningPlanServiceImpl implements LearningPlanService {

    @Autowired
    private LearningPlanRepository learningPlanRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PlanTopicService planTopicService;
    
    @Autowired
    private LearningPlanEnrollmentService enrollmentService;
    
    // Note: LearningPlanEnrollmentRepository is accessed through the enrollmentService

    @Override
    @Transactional
    public LearningPlanDTO createLearningPlan(LearningPlanDTO learningPlanDTO) {
        LearningPlan learningPlan = convertToEntity(learningPlanDTO);
        
        // Save the learning plan first
        LearningPlan savedPlan = learningPlanRepository.save(learningPlan);
        
        // Then handle the topics
        Set<PlanTopicDTO> savedTopics = new HashSet<>();
        if (learningPlanDTO.getTopics() != null) {
            int orderIndex = 0;
            for (PlanTopicDTO topicDTO : learningPlanDTO.getTopics()) {
                topicDTO.setOrderIndex(orderIndex++);
                PlanTopicDTO savedTopic = planTopicService.createPlanTopic(topicDTO, savedPlan.getId());
                savedTopics.add(savedTopic);
            }
        }
        
        LearningPlanDTO result = convertToDTO(savedPlan);
        result.setTopics(savedTopics);
        return result;
    }

    @Override
    @Transactional
    public LearningPlanDTO updateLearningPlan(Long id, LearningPlanDTO learningPlanDTO) {
        LearningPlan existingPlan = learningPlanRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Learning plan not found with id: " + id));
        
        // Update basic information
        existingPlan.setTitle(learningPlanDTO.getTitle());
        existingPlan.setDescription(learningPlanDTO.getDescription());
        existingPlan.setStartDate(learningPlanDTO.getStartDate());
        existingPlan.setEndDate(learningPlanDTO.getEndDate());
        
        // Update the plan first
        LearningPlan updatedPlan = learningPlanRepository.save(existingPlan);
        
        // The topics will be managed by separate endpoints for adding, updating, and removing topics
        
        return convertToDTO(updatedPlan);
    }

    @Override
    @Transactional
    public void deleteLearningPlan(Long id) {
        LearningPlan learningPlan = learningPlanRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Learning plan not found with id: " + id));
        
        // Delete the learning plan (cascades to topics)
        learningPlanRepository.delete(learningPlan);
    }

    @Override
    public LearningPlanDTO getLearningPlanById(Long id) {
        LearningPlan learningPlan = learningPlanRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Learning plan not found with id: " + id));
        
        return convertToDTO(learningPlan);
    }
    
    @Override
    public LearningPlanDTO getLearningPlanByIdWithUserContext(Long id, Long currentUserId) {
        LearningPlan learningPlan = learningPlanRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Learning plan not found with id: " + id));
        
        // Check visibility
        if (learningPlan.getVisibility() == Visibility.PRIVATE && 
                !learningPlan.getUser().getId().equals(currentUserId)) {
            throw new RuntimeException("You do not have permission to view this learning plan");
        }
        
        // Increment view count for public/shared plans
        if (learningPlan.getVisibility() != Visibility.PRIVATE) {
            incrementViewCount(id);
        }
        
        LearningPlanDTO dto = convertToDTO(learningPlan);
        
        // Check if current user is enrolled
        boolean isEnrolled = enrollmentService.isUserEnrolled(id, currentUserId);
        dto.setIsEnrolled(isEnrolled);
        
        // Get participants if public/shared
        if (learningPlan.getVisibility() != Visibility.PRIVATE) {
            List<LearningPlanEnrollmentDTO> participants = enrollmentService.getEnrollmentsByPlanId(id);
            dto.setParticipants(participants);
        }
        
        return dto;
    }

    @Override
    public List<LearningPlanDTO> getLearningPlansByUserId(Long userId) {
        List<LearningPlan> learningPlans = learningPlanRepository.findByUserId(userId);
        
        return learningPlans.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public Page<LearningPlanDTO> getPublicLearningPlans(Pageable pageable) {
        Page<LearningPlan> publicPlans = learningPlanRepository.findByVisibility(Visibility.PUBLIC, pageable);
        return publicPlans.map(this::convertToDTO);
    }
    
    @Override
    public Page<LearningPlanDTO> searchPublicPlans(String query, Pageable pageable) {
        Page<LearningPlan> searchResults = learningPlanRepository.searchPublicPlans(Visibility.PUBLIC, query, pageable);
        return searchResults.map(this::convertToDTO);
    }
    
    @Override
    public Page<LearningPlanDTO> getPopularLearningPlans(Pageable pageable) {
        Page<LearningPlan> popularPlans = learningPlanRepository.findByVisibilityOrderByEnrollmentCountDesc(Visibility.PUBLIC, pageable);
        return popularPlans.map(this::convertToDTO);
    }
    
    @Override
    public Page<LearningPlanDTO> getRecentLearningPlans(Pageable pageable) {
        Page<LearningPlan> recentPlans = learningPlanRepository.findByVisibilityOrderByCreatedAtDesc(Visibility.PUBLIC, pageable);
        return recentPlans.map(this::convertToDTO);
    }
    
    @Override
    @Transactional
    public LearningPlanDTO updateVisibility(Long id, Visibility visibility) {
        LearningPlan learningPlan = learningPlanRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Learning plan not found with id: " + id));
        
        learningPlan.setVisibility(visibility);
        LearningPlan updatedPlan = learningPlanRepository.save(learningPlan);
        
        return convertToDTO(updatedPlan);
    }
    
    @Override
    @Transactional
    public void incrementViewCount(Long id) {
        LearningPlan learningPlan = learningPlanRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Learning plan not found with id: " + id));
        
        learningPlan.setViewCount(learningPlan.getViewCount() + 1);
        learningPlanRepository.save(learningPlan);
    }

    private LearningPlan convertToEntity(LearningPlanDTO dto) {
        LearningPlan entity = new LearningPlan();
        
        entity.setId(dto.getId());
        entity.setTitle(dto.getTitle());
        entity.setDescription(dto.getDescription());
        entity.setStartDate(dto.getStartDate());
        entity.setEndDate(dto.getEndDate());
        
        // Set user
        if (dto.getUser() != null && dto.getUser().getId() != null) {
            User user = userRepository.findById(dto.getUser().getId())
                    .orElseThrow(() -> new UsernameNotFoundException("User not found with id: " + dto.getUser().getId()));
            entity.setUser(user);
        }
        
        // Topics are handled separately
        
        return entity;
    }

    private LearningPlanDTO convertToDTO(LearningPlan entity) {
        LearningPlanDTO dto = new LearningPlanDTO();
        
        dto.setId(entity.getId());
        dto.setTitle(entity.getTitle());
        dto.setDescription(entity.getDescription());
        dto.setStartDate(entity.getStartDate());
        dto.setEndDate(entity.getEndDate());
        dto.setVisibility(entity.getVisibility());
        dto.setEnrollmentCount(entity.getEnrollmentCount());
        dto.setViewCount(entity.getViewCount());
        dto.setTags(entity.getTags());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        dto.setIsEnrolled(false); // Default value, will be overridden when needed
        
        // Set user
        if (entity.getUser() != null) {
            UserDTO userDTO = new UserDTO();
            userDTO.setId(entity.getUser().getId());
            userDTO.setUsername(entity.getUser().getUsername());
            dto.setUser(userDTO);
        }
        
        // Set topics
        if (entity.getTopics() != null) {
            Set<PlanTopicDTO> topicDTOs = entity.getTopics().stream()
                    .map(this::convertTopicToDTO)
                    .collect(Collectors.toSet());
            dto.setTopics(topicDTOs);
        }
        
        return dto;
    }

    private PlanTopicDTO convertTopicToDTO(PlanTopic entity) {
        PlanTopicDTO dto = new PlanTopicDTO();
        
        dto.setId(entity.getId());
        dto.setTitle(entity.getTitle());
        dto.setMaterialLink(entity.getMaterialLink());
        dto.setStatus(entity.getStatus());
        dto.setNotes(entity.getNotes());
        dto.setOrderIndex(entity.getOrderIndex());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        
        return dto;
    }
}
