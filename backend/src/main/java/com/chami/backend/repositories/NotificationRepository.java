package com.chami.backend.repositories;

import com.chami.backend.models.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    
    // Find all notifications for a specific receiver
    List<Notification> findByReceiverId(Long receiverId);
    
    // Find all unread notifications for a specific receiver
    List<Notification> findByReceiverIdAndReadIsFalse(Long receiverId);
    
    // Find paginated notifications for a receiver
    Page<Notification> findByReceiverIdOrderByCreatedAtDesc(Long receiverId, Pageable pageable);
    
    // Count unread notifications
    Long countByReceiverIdAndReadIsFalse(Long receiverId);
    
    // Mark all notifications as read for a user
    @Modifying
    @Query("UPDATE Notification n SET n.read = true WHERE n.receiver.id = :receiverId AND n.read = false")
    int markAllAsRead(Long receiverId);
    
    // Delete all notifications for a user
    @Modifying
    void deleteByReceiverId(Long receiverId);
}
