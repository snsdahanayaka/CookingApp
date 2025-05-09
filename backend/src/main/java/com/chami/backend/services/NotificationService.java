package com.chami.backend.services;

import com.chami.backend.dtos.NotificationDTO;
import com.chami.backend.models.Notification.NotificationType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface NotificationService {
    
    // Create a notification
    NotificationDTO createNotification(Long senderId, Long receiverId, NotificationType type, 
                                       String message, Long relatedEntityId, String relatedEntityType);
    
    // Get all notifications for current user
    Page<NotificationDTO> getUserNotifications(Long userId, Pageable pageable);
    
    // Get unread notification count
    Long getUnreadNotificationCount(Long userId);
    
    // Mark a notification as read
    NotificationDTO markAsRead(Long notificationId);
    
    // Mark all notifications as read for a user
    int markAllAsRead(Long userId);
    
    // Delete a notification
    void deleteNotification(Long notificationId);
    
    // Create like notification
    NotificationDTO createLikeNotification(Long likerId, Long contentOwnerId, Long contentId, String contentType);
    
    // Create comment notification
    NotificationDTO createCommentNotification(Long commenterId, Long contentOwnerId, Long contentId, String contentType);
    
    // Create enrollment notification
    NotificationDTO createEnrollmentNotification(Long enrollerId, Long planOwnerId, Long planId);
}
