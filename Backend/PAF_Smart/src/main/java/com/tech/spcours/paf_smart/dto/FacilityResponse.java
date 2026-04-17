package com.tech.spcours.paf_smart.dto;

import java.time.Instant;
import java.util.List;

import lombok.Builder;

@Builder
public record FacilityResponse(
        String id,
        String code,
        String name,
        String building,
        String block,
        Integer floor,
        String spaceType,
        Integer capacity,
        String description,
        List<String> amenities,
        String imageUrl,
        String status,
        Instant createdAt,
        Instant updatedAt
) {
}
