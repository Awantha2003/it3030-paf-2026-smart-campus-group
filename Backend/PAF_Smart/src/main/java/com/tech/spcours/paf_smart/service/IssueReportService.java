package com.tech.spcours.paf_smart.service;

import java.time.Instant;
import java.util.List;

import org.springframework.stereotype.Service;

import com.tech.spcours.paf_smart.dto.CreateIssueReportRequest;
import com.tech.spcours.paf_smart.dto.IssueReportResponse;
import com.tech.spcours.paf_smart.exception.ResourceNotFoundException;
import com.tech.spcours.paf_smart.model.IssueReport;
import com.tech.spcours.paf_smart.repository.IssueReportRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class IssueReportService {

    private final IssueReportRepository issueReportRepository;

    public IssueReportResponse createIssueReport(CreateIssueReportRequest request) {
        Instant now = Instant.now();

        IssueReport issueReport = IssueReport.builder()
                .title(request.title().trim())
                .description(request.description().trim())
                .category(request.category().trim())
                .location(request.location().trim())
                .priority(request.priority().trim().toUpperCase())
                .status("OPEN")
                .studentId(request.studentId().trim())
                .studentName(request.studentName().trim())
                .studentEmail(request.studentEmail().trim().toLowerCase())
                .attachmentUrls(request.attachmentUrls() == null ? List.of() : request.attachmentUrls())
                .createdAt(now)
                .updatedAt(now)
                .build();

        return toResponse(issueReportRepository.save(issueReport));
    }

    public List<IssueReportResponse> getStudentIssueReports(String studentId) {
        return issueReportRepository.findByStudentIdOrderByCreatedAtDesc(studentId.trim())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public IssueReportResponse getIssueReportById(String id) {
        return toResponse(findIssueReportById(id));
    }

    private IssueReport findIssueReportById(String id) {
        return issueReportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Issue report not found"));
    }

    private IssueReportResponse toResponse(IssueReport issueReport) {
        return IssueReportResponse.builder()
                .id(issueReport.getId())
                .title(issueReport.getTitle())
                .description(issueReport.getDescription())
                .category(issueReport.getCategory())
                .location(issueReport.getLocation())
                .priority(issueReport.getPriority())
                .status(issueReport.getStatus())
                .studentId(issueReport.getStudentId())
                .studentName(issueReport.getStudentName())
                .studentEmail(issueReport.getStudentEmail())
                .attachmentUrls(issueReport.getAttachmentUrls())
                .createdAt(issueReport.getCreatedAt())
                .updatedAt(issueReport.getUpdatedAt())
                .build();
    }
}
