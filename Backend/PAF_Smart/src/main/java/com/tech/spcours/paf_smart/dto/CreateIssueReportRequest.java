package com.tech.spcours.paf_smart.dto;

import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateIssueReportRequest(
        @NotBlank(message = "Title is required")
        @Size(max = 120, message = "Title must not exceed 120 characters")
        String title,

        @NotBlank(message = "Description is required")
        @Size(max = 2000, message = "Description must not exceed 2000 characters")
        String description,

        @NotBlank(message = "Category is required")
        String category,

        @NotBlank(message = "Location is required")
        @Size(max = 150, message = "Location must not exceed 150 characters")
        String location,

        @NotBlank(message = "Priority is required")
        String priority,

        @NotBlank(message = "Student id is required")
        String studentId,

        @NotBlank(message = "Student name is required")
        @Size(max = 100, message = "Student name must not exceed 100 characters")
        String studentName,

        @NotBlank(message = "Student email is required")
        String studentEmail,

        List<String> attachmentUrls) {
}
