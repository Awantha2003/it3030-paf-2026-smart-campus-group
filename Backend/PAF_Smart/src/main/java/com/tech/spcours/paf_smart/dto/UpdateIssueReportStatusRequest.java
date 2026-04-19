package com.tech.spcours.paf_smart.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateIssueReportStatusRequest(
        @NotBlank(message = "Status is required")
        String status,

        @Size(max = 1000, message = "Rejection reason must not exceed 1000 characters")
        String rejectionReason) {
}
