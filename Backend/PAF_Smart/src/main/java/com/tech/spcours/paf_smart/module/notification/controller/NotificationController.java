package com.tech.spcours.paf_smart.module.notification.controller;

import com.tech.spcours.paf_smart.module.notification.model.Notification;
import com.tech.spcours.paf_smart.module.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class NotificationController {

    private final NotificationService notificationService;

    private String getCurrentUserId(Authentication authentication) {
        var user = (com.tech.spcours.paf_smart.module.user.model.User) authentication.getPrincipal();
        return user.getId();
    }

    @GetMapping
    public ResponseEntity<List<Notification>> getNotifications(Authentication authentication) {
        return ResponseEntity.ok(notificationService.getUserNotifications(getCurrentUserId(authentication)));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(Authentication authentication) {
        long count = notificationService.getUnreadCount(getCurrentUserId(authentication));
        return ResponseEntity.ok(Map.of("count", count));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<Notification> markAsRead(@PathVariable String id, Authentication authentication) {
        return ResponseEntity.ok(notificationService.markAsRead(id, getCurrentUserId(authentication)));
    }

    @PatchMapping("/read-all")
    public ResponseEntity<Map<String, String>> markAllAsRead(Authentication authentication) {
        notificationService.markAllAsRead(getCurrentUserId(authentication));
        return ResponseEntity.ok(Map.of("message", "All notifications marked as read"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteNotification(@PathVariable String id,
            Authentication authentication) {
        notificationService.deleteNotification(id, getCurrentUserId(authentication));
        return ResponseEntity.ok(Map.of("message", "Notification deleted"));
    }

    @DeleteMapping("/clear-all")
    public ResponseEntity<Map<String, String>> clearAllNotifications(Authentication authentication) {
        notificationService.deleteAllNotifications(getCurrentUserId(authentication));
        return ResponseEntity.ok(Map.of("message", "All notifications cleared"));
    }

    // TEMPORARY ENDPOINT FOR TESTING THE FLOW
    @PostMapping("/test-send")
    public ResponseEntity<Notification> sendTestNotification(Authentication authentication) {
        Notification testNotif = notificationService.send(
                getCurrentUserId(authentication),
                "Test Notification Worker",
                "This is a test notification to see if the UI updates!",
                "SYSTEM",
                "test-123");
        return ResponseEntity.ok(testNotif);
    }
}
