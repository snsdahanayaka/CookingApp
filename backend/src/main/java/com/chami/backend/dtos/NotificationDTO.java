package com.chami.backend.dtos;

import com.chami.backend.models.Notification.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDTO {
    private Long id;
    private NotificationType type;
    private UserDTO sender;
    private UserDTO receiver;
    private String message;
    private boolean read;
    private LocalDateTime createdAt;
    private Long relatedEntityId;
    private String relatedEntityType;
}
