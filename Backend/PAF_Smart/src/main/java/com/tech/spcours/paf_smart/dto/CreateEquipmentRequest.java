package com.tech.spcours.paf_smart.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateEquipmentRequest(
        @NotBlank(message = "Facility ID is required")
        String facilityId,

        @NotBlank(message = "Equipment name is required")
        String name,

        String description,

        @NotNull(message = "Total quantity is required")
        @Min(value = 0, message = "Quantity cannot be negative")
        Integer totalQuantity,

        boolean approvalRequired,

        String imageUrl
) {
}
