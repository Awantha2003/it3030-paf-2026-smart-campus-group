package com.tech.spcours.paf_smart.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateIssueReportNoteRequest(
        @NotBlank(message = "Admin note is required")
        @Size(max = 1000, message = "Admin note must not exceed 1000 characters")
        String adminNote) {
}
