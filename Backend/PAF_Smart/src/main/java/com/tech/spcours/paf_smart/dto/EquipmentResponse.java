package com.tech.spcours.paf_smart.dto;

import java.time.Instant;

import lombok.Builder;

@Builder
public record EquipmentResponse(
        String id,
        String facilityId,
        String name,
        String description,
        Integer totalQuantity,
        Integer availableQuantity,
        String status,
        boolean approvalRequired,
        String imageUrl,
        Instant createdAt,
        Instant updatedAt
) {
}
