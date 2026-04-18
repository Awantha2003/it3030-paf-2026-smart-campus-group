package com.tech.spcours.paf_smart.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UpdateIssueReportFeedbackRequest(
        @NotNull(message = "Feedback rating is required")
        @Min(value = 1, message = "Feedback rating must be between 1 and 5")
        @Max(value = 5, message = "Feedback rating must be between 1 and 5")
        Integer feedbackRating,

        @Size(max = 1000, message = "Feedback comment must not exceed 1000 characters")
        String feedbackComment) {
}
