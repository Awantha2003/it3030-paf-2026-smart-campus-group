package com.tech.spcours.paf_smart.dto;

import java.time.Instant;

import lombok.Builder;

@Builder
public record TechnicianResponse(
        String id,
        String fullName,
        String email,
        String phone,
        String department,
        String specialization,
        boolean active,
        Instant createdAt,
        Instant updatedAt) {
}
