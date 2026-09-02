package com.agriprocure.service;

import com.agriprocure.dto.NotificationResponse;
import com.agriprocure.entity.Notification;
import com.agriprocure.entity.NotificationType;
import com.agriprocure.entity.User;
import com.agriprocure.exception.ResourceNotFoundException;
import com.agriprocure.repository.NotificationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final com.agriprocure.websocket.WebSocketEventPublisher eventPublisher;

    public NotificationService(NotificationRepository notificationRepository,
                               com.agriprocure.websocket.WebSocketEventPublisher eventPublisher) {
        this.notificationRepository = notificationRepository;
        this.eventPublisher = eventPublisher;
    }

    public void sendNotification(User user, String title, String message, NotificationType type) {
        if (user == null) return;
        Notification notification = new Notification(user, title, message, type);
        Notification saved = notificationRepository.save(notification);
        NotificationResponse response = mapToResponse(saved);
        com.agriprocure.dto.RealtimeEvent event = new com.agriprocure.dto.RealtimeEvent(
                com.agriprocure.dto.RealtimeEventType.NOTIFICATION_CREATED,
                null,
                "NOTIFICATION",
                saved.getId().toString(),
                response
        );
        eventPublisher.publishToUser(user.getUsername(), "notifications", event);
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> getUserNotifications(UUID userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(UUID userId) {
        return notificationRepository.countByUserIdAndReadFalse(userId);
    }

    public void markAsRead(UUID notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with ID: " + notificationId));
        notification.setRead(true);
        notificationRepository.save(notification);
    }

    private NotificationResponse mapToResponse(Notification n) {
        return new NotificationResponse(
                n.getId(),
                n.getUser().getId(),
                n.getTitle(),
                n.getMessage(),
                n.getType(),
                n.isRead(),
                n.getCreatedAt()
        );
    }
}
