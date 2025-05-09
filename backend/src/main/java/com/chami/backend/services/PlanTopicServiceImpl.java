package com.chami.backend.services;

import com.chami.backend.dtos.PlanTopicDTO;
import com.chami.backend.models.LearningPlan;
import com.chami.backend.models.PlanTopic;
import com.chami.backend.models.PlanTopic.TopicStatus;
import com.chami.backend.repositories.LearningPlanRepository;
import com.chami.backend.repositories.PlanTopicRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PlanTopicServiceImpl implements PlanTopicService {

    @Autowired
    private PlanTopicRepository planTopicRepository;

    @Autowired
    private LearningPlanRepository learningPlanRepository;

    @Override
    @Transactional
    public PlanTopicDTO createPlanTopic(PlanTopicDTO planTopicDTO, Long learningPlanId) {
        LearningPlan learningPlan = learningPlanRepository.findById(learningPlanId)
                .orElseThrow(() -> new RuntimeException("Learning plan not found with id: " + learningPlanId));
        
        PlanTopic planTopic = convertToEntity(planTopicDTO);
        planTopic.setLearningPlan(learningPlan);
        
        PlanTopic savedTopic = planTopicRepository.save(planTopic);
        return convertToDTO(savedTopic);
    }

    @Override
    @Transactional
    public PlanTopicDTO updatePlanTopic(Long id, PlanTopicDTO planTopicDTO) {
        PlanTopic existingTopic = planTopicRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Plan topic not found with id: " + id));
        
        // Update fields
        existingTopic.setTitle(planTopicDTO.getTitle());
        existingTopic.setMaterialLink(planTopicDTO.getMaterialLink());
        existingTopic.setNotes(planTopicDTO.getNotes());
        existingTopic.setOrderIndex(planTopicDTO.getOrderIndex());
        if (planTopicDTO.getStatus() != null) {
            existingTopic.setStatus(planTopicDTO.getStatus());
        }
        
        PlanTopic updatedTopic = planTopicRepository.save(existingTopic);
        return convertToDTO(updatedTopic);
    }

    @Override
    @Transactional
    public PlanTopicDTO updateTopicStatus(Long id, TopicStatus status) {
        PlanTopic existingTopic = planTopicRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Plan topic not found with id: " + id));
        
        existingTopic.setStatus(status);
        PlanTopic updatedTopic = planTopicRepository.save(existingTopic);
        return convertToDTO(updatedTopic);
    }

    @Override
    @Transactional
    public void deletePlanTopic(Long id) {
        PlanTopic planTopic = planTopicRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Plan topic not found with id: " + id));
        
        planTopicRepository.delete(planTopic);
    }

    @Override
    public PlanTopicDTO getPlanTopicById(Long id) {
        PlanTopic planTopic = planTopicRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Plan topic not found with id: " + id));
        
        return convertToDTO(planTopic);
    }

    @Override
    public List<PlanTopicDTO> getPlanTopicsByLearningPlanId(Long learningPlanId) {
        List<PlanTopic> planTopics = planTopicRepository.findByLearningPlanIdOrderByOrderIndexAsc(learningPlanId);
        
        return planTopics.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private PlanTopic convertToEntity(PlanTopicDTO dto) {
        PlanTopic entity = new PlanTopic();
        
        entity.setId(dto.getId());
        entity.setTitle(dto.getTitle());
        entity.setMaterialLink(dto.getMaterialLink());
        entity.setNotes(dto.getNotes());
        entity.setOrderIndex(dto.getOrderIndex());
        
        if (dto.getStatus() != null) {
            entity.setStatus(dto.getStatus());
        } else {
            entity.setStatus(TopicStatus.NOT_STARTED);
        }
        
        return entity;
    }

    private PlanTopicDTO convertToDTO(PlanTopic entity) {
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
