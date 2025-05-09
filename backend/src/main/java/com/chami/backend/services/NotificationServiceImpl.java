package com.chami.backend.services;

import com.chami.backend.dtos.NotificationDTO;
import com.chami.backend.dtos.UserDTO;
import com.chami.backend.models.Notification;
import com.chami.backend.models.Notification.NotificationType;
import com.chami.backend.models.User;
import com.chami.backend.repositories.NotificationRepository;
import com.chami.backend.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityNotFoundException;

@Service
public class NotificationServiceImpl implements NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    @Transactional
    public NotificationDTO createNotification(Long senderId, Long receiverId, NotificationType type, 
                                           String message, Long relatedEntityId, String relatedEntityType) {
        // Allow system notifications to self (when sender is null)
        if (senderId != null && senderId.equals(receiverId) && !type.equals(NotificationType.SYSTEM_MESSAGE)) {
            return null;
        }
        
        User sender = null;
        if (senderId != null) {
            try {
                sender = userRepository.findById(senderId)
                        .orElseThrow(() -> new EntityNotFoundException("Sender not found with id: " + senderId));
            } catch (Exception e) {
                // Log the error but continue with null sender for system messages
                System.err.println("Error finding sender: " + e.getMessage());
                if (!type.equals(NotificationType.SYSTEM_MESSAGE)) {
                    throw e; // rethrow if not a system message
                }
            }
        }
        
        User receiver;
        try {
            receiver = userRepository.findById(receiverId)
                    .orElseThrow(() -> new EntityNotFoundException("Receiver not found with id: " + receiverId));
        } catch (Exception e) {
            System.err.println("Error finding receiver: " + e.getMessage());
            return null; // Skip notification if receiver doesn't exist
        }
        
        Notification notification = new Notification();
        notification.setSender(sender); // Can be null for system notifications
        notification.setReceiver(receiver);
        notification.setType(type);
        notification.setMessage(message);
        notification.setRelatedEntityId(relatedEntityId); // Can be null
        notification.setRelatedEntityType(relatedEntityType); // Can be null for system notifications
        notification.setRead(false);
        
        try {
            Notification savedNotification = notificationRepository.save(notification);
            return convertToDTO(savedNotification);
        } catch (Exception e) {
            System.err.println("Error saving notification: " + e.getMessage());
            return null;
        }
    }

    @Override
    public Page<NotificationDTO> getUserNotifications(Long userId, Pageable pageable) {
        return notificationRepository.findByReceiverIdOrderByCreatedAtDesc(userId, pageable)
                .map(this::convertToDTO);
    }

    @Override
    public Long getUnreadNotificationCount(Long userId) {
        return notificationRepository.countByReceiverIdAndReadIsFalse(userId);
    }

    @Override
    @Transactional
    public NotificationDTO markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new EntityNotFoundException("Notification not found with id: " + notificationId));
        
        notification.setRead(true);
        Notification savedNotification = notificationRepository.save(notification);
        return convertToDTO(savedNotification);
    }

    @Override
    @Transactional
    public int markAllAsRead(Long userId) {
        return notificationRepository.markAllAsRead(userId);
    }

    @Override
    @Transactional
    public void deleteNotification(Long notificationId) {
        notificationRepository.deleteById(notificationId);
    }

    @Override
    public NotificationDTO createLikeNotification(Long likerId, Long contentOwnerId, Long contentId, String contentType) {
        String message = "liked your " + contentType.toLowerCase();
        return createNotification(likerId, contentOwnerId, NotificationType.LIKE, message, contentId, contentType);
    }

    @Override
    public NotificationDTO createCommentNotification(Long commenterId, Long contentOwnerId, Long contentId, String contentType) {
        String message = "commented on your " + contentType.toLowerCase();
        return createNotification(commenterId, contentOwnerId, NotificationType.COMMENT, message, contentId, contentType);
    }

    @Override
    public NotificationDTO createEnrollmentNotification(Long enrollerId, Long planOwnerId, Long planId) {
        String message = "enrolled in your learning plan";
        return createNotification(enrollerId, planOwnerId, NotificationType.ENROLLMENT, message, planId, "LEARNING_PLAN");
    }

    private NotificationDTO convertToDTO(Notification notification) {
        if (notification == null) return null;
        
        NotificationDTO dto = new NotificationDTO();
        dto.setId(notification.getId());
        dto.setType(notification.getType());
        dto.setMessage(notification.getMessage());
        dto.setRead(notification.isRead());
        dto.setCreatedAt(notification.getCreatedAt());
        dto.setRelatedEntityId(notification.getRelatedEntityId());
        dto.setRelatedEntityType(notification.getRelatedEntityType());
        
        if (notification.getSender() != null) {
            UserDTO senderDTO = new UserDTO();
            senderDTO.setId(notification.getSender().getId());
            senderDTO.setUsername(notification.getSender().getUsername());
            dto.setSender(senderDTO);
        }
        
        UserDTO receiverDTO = new UserDTO();
        receiverDTO.setId(notification.getReceiver().getId());
        receiverDTO.setUsername(notification.getReceiver().getUsername());
        dto.setReceiver(receiverDTO);
        
        return dto;
    }
}
