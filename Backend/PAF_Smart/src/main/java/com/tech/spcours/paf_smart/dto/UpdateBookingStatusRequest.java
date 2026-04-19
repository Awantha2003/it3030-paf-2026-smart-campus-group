package com.tech.spcours.paf_smart.dto;

import jakarta.validation.constraints.NotBlank;

public record UpdateBookingStatusRequest(
        @NotBlank(message = "Status is required")
        String status,
        
        String rejectionReason,

        String cancellationReason
) {}
