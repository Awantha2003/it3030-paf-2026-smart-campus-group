package com.tech.spcours.paf_smart.dto;

import jakarta.validation.constraints.NotBlank;

public record AssignIssueReportRequest(
        @NotBlank(message = "Technician id is required")
        String technicianId) {
}
