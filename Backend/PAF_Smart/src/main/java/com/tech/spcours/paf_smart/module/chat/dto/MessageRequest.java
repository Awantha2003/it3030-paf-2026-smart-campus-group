package com.tech.spcours.paf_smart.module.chat.dto;

import lombok.Data;

@Data
public class MessageRequest {
    private String receiverId;
    private String content;
}
