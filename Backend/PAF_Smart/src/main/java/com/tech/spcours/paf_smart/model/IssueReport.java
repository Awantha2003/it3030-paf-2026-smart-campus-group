package com.tech.spcours.paf_smart.model;

import java.time.Instant;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "issue_reports")
public class IssueReport {

    @Id
    private String id;

    private String title;

    private String description;

    private String category;

    private String location;

    private String priority;

    private String status;

    private String studentId;

    private String studentName;

    private String studentEmail;

    private List<String> attachmentUrls;

    private String assignedTo;

    private String adminNote;

    private Instant createdAt;

    private Instant updatedAt;
}
