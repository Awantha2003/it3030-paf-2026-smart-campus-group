package com.tech.spcours.paf_smart.module.chat.repository;

import com.tech.spcours.paf_smart.module.chat.model.ChatMessage;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ChatMessageRepository extends MongoRepository<ChatMessage, String> {
    List<ChatMessage> findBySenderIdAndReceiverIdOrSenderIdAndReceiverIdOrderByTimestampAsc(
            String id1, String id2, String id3, String id4);
}
