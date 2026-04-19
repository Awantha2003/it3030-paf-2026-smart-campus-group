package com.tech.spcours.paf_smart.dto;

import java.time.LocalDate;
import java.time.LocalTime;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateResourceBookingRequest(
        @NotBlank(message = "Resource type is required")
        String resourceType,

        @NotBlank(message = "Resource id is required")
        String resourceId,

        @NotNull(message = "Booking date is required")
        LocalDate bookingDate,

        @NotNull(message = "Booking time is required")
        LocalTime bookingTime,

        @NotNull(message = "Requested quantity is required")
        @Min(value = 1, message = "Requested quantity must be at least 1")
        @Max(value = 200, message = "Requested quantity is too high")
        Integer quantity,

        @NotNull(message = "Duration is required")
        @Min(value = 1, message = "Duration must be at least 1 hour")
        @Max(value = 12, message = "Duration cannot exceed 12 hours")
        Integer durationHours,

        @NotBlank(message = "Purpose is required")
        @Size(min = 8, max = 1000, message = "Purpose must contain 8 to 1000 characters")
        String purpose) {
}
