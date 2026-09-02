package com.agriprocure.controller;

import com.agriprocure.dto.ApiResponse;
import com.agriprocure.dto.NotificationResponse;
import com.agriprocure.security.SecurityUtils;
import com.agriprocure.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping({"", "/user/{userId}"})
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getUserNotifications(
            @PathVariable(required = false) UUID userId,
            @RequestParam(name = "userId", required = false) UUID queryUserId) {
        UUID targetUserId = userId != null ? userId : queryUserId;
        if (targetUserId == null) {
            targetUserId = SecurityUtils.getCurrentUserId();
        }
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        if (!SecurityUtils.isAdmin() && (currentUserId == null || !currentUserId.equals(targetUserId))) {
            throw new AccessDeniedException("Access denied. You can only view your own notifications.");
        }
        List<NotificationResponse> notifications = notificationService.getUserNotifications(targetUserId);
        return ResponseEntity.ok(ApiResponse.success("Notifications retrieved", notifications));
    }

    @GetMapping({"/unread-count", "/user/{userId}/unread-count"})
    public ResponseEntity<ApiResponse<Long>> getUnreadNotificationCount(
            @PathVariable(required = false) UUID userId,
            @RequestParam(name = "userId", required = false) UUID queryUserId) {
        UUID targetUserId = userId != null ? userId : queryUserId;
        if (targetUserId == null) {
            targetUserId = SecurityUtils.getCurrentUserId();
        }
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        if (!SecurityUtils.isAdmin() && (currentUserId == null || !currentUserId.equals(targetUserId))) {
            throw new AccessDeniedException("Access denied.");
        }
        long count = notificationService.getUnreadCount(targetUserId);
        return ResponseEntity.ok(ApiResponse.success("Unread notification count", count));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(@PathVariable UUID id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok(ApiResponse.success("Notification marked as read", null));
    }
}
