package com.tech.spcours.paf_smart.dto;

import jakarta.validation.constraints.NotBlank;

public record UpdateIssueReportStatusRequest(
        @NotBlank(message = "Status is required")
        String status) {
}
