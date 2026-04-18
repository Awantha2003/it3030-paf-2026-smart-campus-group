package com.tech.spcours.paf_smart.dto;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;

import lombok.Builder;

@Builder
public record FacilityBookingResponse(
        String id,
        String studentId,
        String studentName,
        String studentEmail,
        String faculty,
        LocalDate bookingDate,
        LocalTime bookingTime,
        Integer durationHours,
        Integer studentCount,
        String lectureHallCode,
        String building,
        String block,
        Integer floor,
        String lectureHallName,
        String status,
        String rejectionReason,
        Instant createdAt,
        Instant updatedAt) {
}
