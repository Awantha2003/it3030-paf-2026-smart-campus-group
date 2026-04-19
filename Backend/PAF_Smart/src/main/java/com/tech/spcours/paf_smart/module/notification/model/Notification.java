package com.tech.spcours.paf_smart.module.notification.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "notifications")
public class Notification {
    @Id
    private String id;
    private String userId;
    private String title;
    private String message;
    private String type; // BOOKING, TICKET, SYSTEM, COMMENT
    private String referenceId; // bookingId or ticketId
    private boolean isRead;
    private LocalDateTime createdAt;
}
