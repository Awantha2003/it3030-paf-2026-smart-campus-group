package com.tech.spcours.paf_smart.dto;

import java.time.LocalDate;
import java.time.LocalTime;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateFacilityBookingRequest(
        @NotBlank(message = "Faculty is required")
        String faculty,

        @NotBlank(message = "Lecture hall is required")
        String lectureHallCode,

        @NotNull(message = "Date is required")
        LocalDate bookingDate,

        @NotNull(message = "Time is required")
        LocalTime bookingTime,

        @NotNull(message = "Student count is required")
        @Min(value = 1, message = "Student count must be at least 1")
        @Max(value = 60, message = "Student count cannot exceed 60")
        Integer studentCount) {
}
