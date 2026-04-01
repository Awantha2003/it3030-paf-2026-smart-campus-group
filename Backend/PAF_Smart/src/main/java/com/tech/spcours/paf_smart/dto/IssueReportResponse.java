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
        List<String> attachmentUrls,
        Instant createdAt,
        Instant updatedAt) {
}
