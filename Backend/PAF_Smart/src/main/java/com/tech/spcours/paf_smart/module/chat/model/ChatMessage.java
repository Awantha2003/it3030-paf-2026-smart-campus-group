package com.tech.spcours.paf_smart.module.chat.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Document(collection = "chat_messages")
public class ChatMessage {
    @Id
    private String id;
    private String senderId;
    private String receiverId;
    private String content;
    private LocalDateTime timestamp = LocalDateTime.now();
    private boolean isRead = false;
}
