package com.tech.spcours.paf_smart.dto;

import java.util.List;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateFacilityRequest(
        @NotBlank(message = "Facility code is required")
        String code,

        @NotBlank(message = "Facility name is required")
        String name,

        String building,
        String block,
        Integer floor,

        @NotBlank(message = "Space type is required")
        String spaceType,

        @NotNull(message = "Capacity is required")
        @Min(value = 1, message = "Capacity must be at least 1")
        Integer capacity,

        String description,

        List<String> amenities,

        String imageUrl,
        
        String status
) {
}
