package com.tech.spcours.paf_smart.service;

import java.time.Instant;
import java.util.List;
import java.util.Set;

import org.springframework.stereotype.Service;

import com.tech.spcours.paf_smart.dto.CreateIssueReportRequest;
import com.tech.spcours.paf_smart.dto.IssueReportResponse;
import com.tech.spcours.paf_smart.exception.ResourceConflictException;
import com.tech.spcours.paf_smart.exception.ResourceNotFoundException;
import com.tech.spcours.paf_smart.model.IssueReport;
import com.tech.spcours.paf_smart.model.TechnicianMember;
import com.tech.spcours.paf_smart.repository.IssueReportRepository;
import com.tech.spcours.paf_smart.repository.TechnicianMemberRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class IssueReportService {

    private static final Set<String> ALLOWED_STATUSES = Set.of(
            "OPEN",
            "IN_PROGRESS",
            "RESOLVED",
            "REJECTED",
            "CLOSED");

    private final IssueReportRepository issueReportRepository;
    private final TechnicianMemberRepository technicianMemberRepository;

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
                .assignedTo(null)
                .adminNote(null)
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

    public List<IssueReportResponse> getAllIssueReports() {
        return issueReportRepository.findAll()
                .stream()
                .sorted((left, right) -> right.getCreatedAt().compareTo(left.getCreatedAt()))
                .map(this::toResponse)
                .toList();
    }

    public IssueReportResponse getIssueReportById(String id) {
        return toResponse(findIssueReportById(id));
    }

    public IssueReportResponse updateIssueReportStatus(String id, String status) {
        IssueReport issueReport = findIssueReportById(id);
        String normalizedStatus = normalizeStatus(status);

        if (issueReport.getStatus().equals(normalizedStatus)) {
            throw new ResourceConflictException("Issue report already has this status");
        }

        issueReport.setStatus(normalizedStatus);
        issueReport.setUpdatedAt(Instant.now());

        return toResponse(issueReportRepository.save(issueReport));
    }

    public IssueReportResponse assignIssueReport(String id, String technicianId) {
        IssueReport issueReport = findIssueReportById(id);
        TechnicianMember technicianMember = technicianMemberRepository.findById(technicianId.trim())
                .orElseThrow(() -> new ResourceNotFoundException("Technician account not found"));

        if (!technicianMember.isActive()) {
            throw new ResourceConflictException("Cannot assign an inactive technician");
        }

        issueReport.setAssignedTo(technicianMember.getId());
        if ("OPEN".equals(issueReport.getStatus())) {
            issueReport.setStatus("IN_PROGRESS");
        }
        issueReport.setUpdatedAt(Instant.now());

        return toResponse(issueReportRepository.save(issueReport));
    }

    public IssueReportResponse updateIssueReportAdminNote(String id, String adminNote) {
        IssueReport issueReport = findIssueReportById(id);
        issueReport.setAdminNote(adminNote.trim());
        issueReport.setUpdatedAt(Instant.now());

        return toResponse(issueReportRepository.save(issueReport));
    }

    private IssueReport findIssueReportById(String id) {
        return issueReportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Issue report not found"));
    }

    private String normalizeStatus(String status) {
        if (status == null || status.isBlank()) {
            throw new ResourceConflictException("Issue report status is required");
        }

        String normalizedStatus = status.trim().toUpperCase();

        if (!ALLOWED_STATUSES.contains(normalizedStatus)) {
            throw new ResourceConflictException("Unsupported issue report status");
        }

        return normalizedStatus;
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
                .assignedTo(issueReport.getAssignedTo())
                .adminNote(issueReport.getAdminNote())
                .createdAt(issueReport.getCreatedAt())
                .updatedAt(issueReport.getUpdatedAt())
                .build();
    }
}
