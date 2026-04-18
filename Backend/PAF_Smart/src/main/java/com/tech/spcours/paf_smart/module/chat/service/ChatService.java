package com.tech.spcours.paf_smart.module.chat.service;

import com.tech.spcours.paf_smart.module.chat.model.ChatMessage;
import com.tech.spcours.paf_smart.module.chat.repository.ChatMessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatService {
    private final ChatMessageRepository repo;

    public ChatMessage sendMessage(String senderId, String receiverId, String content) {
        ChatMessage msg = new ChatMessage();
        msg.setSenderId(senderId);
        msg.setReceiverId(receiverId);
        msg.setContent(content);
        return repo.save(msg);
    }

    public List<ChatMessage> getConversation(String u1, String u2) {
        return repo.findBySenderIdAndReceiverIdOrSenderIdAndReceiverIdOrderByTimestampAsc(u1, u2, u2, u1);
    }
}
