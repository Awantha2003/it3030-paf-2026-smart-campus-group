package com.tech.spcours.paf_smart.dto;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;

import lombok.Builder;

@Builder
public record ResourceBookingResponse(
        String id,
        String resourceType,
        String resourceId,
        String resourceName,
        String studentId,
        String studentName,
        String studentEmail,
        LocalDate bookingDate,
        LocalTime bookingTime,
        Integer durationHours,
        Integer quantity,
        String purpose,
        String status,
        Instant createdAt,
        Instant updatedAt) {
}
