package com.tech.spcours.paf_smart.dto;

import java.time.Instant;
import java.util.List;

import lombok.Builder;

@Builder
public record IssueReportResponse(
        String id,
        String title,
        String description,
        String category,
        String location,
        String priority,
        String status,
        String studentId,
        String studentName,
        String studentEmail,
        String registrationNumber,
        String faculty,
        String contactNumber,
        String requestType,
        String requestSubType,
        String department,
        List<String> attachmentUrls,
        String assignedTo,
        String adminNote,
        Instant createdAt,
        Instant updatedAt) {
}
