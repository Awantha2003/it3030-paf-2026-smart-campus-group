package com.tech.spcours.paf_smart.service;

import java.time.Instant;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.stereotype.Service;

import com.tech.spcours.paf_smart.dto.CreateIssueReportRequest;
import com.tech.spcours.paf_smart.dto.IssueReportResponse;
import com.tech.spcours.paf_smart.exception.ResourceConflictException;
import com.tech.spcours.paf_smart.exception.ResourceNotFoundException;
import com.tech.spcours.paf_smart.module.user.model.Role;
import com.tech.spcours.paf_smart.module.user.model.User;
import com.tech.spcours.paf_smart.model.IssueReport;
import com.tech.spcours.paf_smart.model.TechnicianMember;
import com.tech.spcours.paf_smart.repository.IssueReportRepository;
import com.tech.spcours.paf_smart.repository.TechnicianMemberRepository;
import com.tech.spcours.paf_smart.module.notification.service.NotificationService;
import com.tech.spcours.paf_smart.module.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class IssueReportService {

    private static final Pattern COORDINATE_PATTERN = Pattern.compile("(-?\\d+(?:\\.\\d+)?)\\s*,\\s*(-?\\d+(?:\\.\\d+)?)");
    private static final Set<String> ALLOWED_STATUSES = Set.of(
            "OPEN",
            "IN_PROGRESS",
            "RESOLVED",
            "REJECTED",
            "CLOSED");

    private final IssueReportRepository issueReportRepository;
    private final TechnicianMemberRepository technicianMemberRepository;
    private final NotificationService notificationService;
    private final UserRepository userRepository;
    private final TechnicianMemberService technicianMemberService;

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
                .registrationNumber(request.registrationNumber().trim())
                .faculty(request.faculty().trim())
                .contactNumber(request.contactNumber().trim())
                .requestType(request.requestType().trim())
                .requestSubType(normalizeOptionalValue(request.requestSubType()))
                .department(request.department().trim())
                .attachmentUrls(request.attachmentUrls() == null ? List.of() : request.attachmentUrls())
                .assignedTo(null)
                .assignedAt(null)
                .adminNote(null)
                .rejectionReason(null)
                .studentFeedbackRating(null)
                .studentFeedbackComment(null)
                .studentFeedbackSubmittedAt(null)
                .createdAt(now)
                .updatedAt(now)
                .build();

        if ("CRITICAL".equals(issueReport.getPriority())) {
            userRepository.findAll().stream().filter(u -> u.getRole() == Role.TECHNICIAN)
                    .forEach(technicianMemberService::syncTechnicianAccount);

            selectBestActiveTechnician(issueReport)
                    .ifPresent(technician -> {
                        issueReport.setAssignedTo(technician.getId());
                        issueReport.setAssignedAt(now);
                        issueReport.setStatus("IN_PROGRESS");
                        userRepository.findAll().stream()
                            .filter(u -> u.getEmail().equalsIgnoreCase(technician.getEmail()) && u.getRole() == Role.TECHNICIAN)
                            .findFirst()
                            .ifPresent(user -> {
                                notificationService.send(user.getId(), "New Ticket Assigned", "You have been assigned a critical ticket: " + issueReport.getTitle(), "TICKETS", issueReport.getId());
                            });
                    });
        }

        IssueReport saved = issueReportRepository.save(issueReport);
        
        userRepository.findByRole(Role.ADMIN).forEach(admin -> {
            notificationService.send(admin.getId(), "New Ticket Raised", "A new ticket has been raised by " + issueReport.getStudentName() + ": " + issueReport.getTitle(), "TICKET", saved.getId());
        });
        
        // Notify the user who created the ticket
        if (issueReport.getStudentId() != null && !issueReport.getStudentId().isEmpty()) {
            notificationService.send(issueReport.getStudentId(), "Ticket Created", "Your ticket '" + issueReport.getTitle() + "' has been successfully created. We will review it shortly.", "TICKET", saved.getId());
        }

        return toResponse(saved);
    }

    public List<IssueReportResponse> getStudentIssueReports(String studentId) {
        return issueReportRepository.findByStudentIdOrderByCreatedAtDesc(studentId.trim())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public List<IssueReportResponse> getTechnicianIssueReports(String technicianId) {
        LinkedHashSet<String> technicianIds = new LinkedHashSet<>();
        String normalizedTechnicianId = technicianId == null ? "" : technicianId.trim();

        if (!normalizedTechnicianId.isBlank()) {
            technicianIds.add(normalizedTechnicianId);
            try {
                technicianIds.add(technicianMemberService.resolveTechnicianMember(normalizedTechnicianId).getId());
            } catch (ResourceNotFoundException ignored) {
                // Keep the original identifier so legacy assignments still load.
            }
        }

        if (technicianIds.isEmpty()) {
            return List.of();
        }

        return issueReportRepository.findByAssignedToInOrderByCreatedAtDesc(technicianIds)
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

    public IssueReportResponse updateIssueReportStatus(String id, String status, String rejectionReason) {
        IssueReport issueReport = findIssueReportById(id);
        String normalizedStatus = normalizeStatus(status);
        String normalizedRejectionReason = normalizeOptionalValue(rejectionReason);

        if (issueReport.getStatus().equals(normalizedStatus)
                && (!"REJECTED".equals(normalizedStatus)
                        || java.util.Objects.equals(issueReport.getRejectionReason(), normalizedRejectionReason))) {
            throw new ResourceConflictException("Issue report already has this status");
        }

        if ("REJECTED".equals(normalizedStatus) && normalizedRejectionReason == null) {
            throw new ResourceConflictException("Rejection reason is required when rejecting a ticket");
        }

        issueReport.setStatus(normalizedStatus);
        issueReport.setRejectionReason("REJECTED".equals(normalizedStatus) ? normalizedRejectionReason : null);
        issueReport.setUpdatedAt(Instant.now());
        
        IssueReport saved = issueReportRepository.save(issueReport);
        
        notificationService.send(saved.getStudentId(), "Ticket Status Updated", "Your ticket '" + saved.getTitle() + "' status has been changed to " + normalizedStatus, "TICKETS", saved.getId());

        return toResponse(saved);
    }

    public IssueReportResponse assignIssueReport(String id, String technicianId) {
        IssueReport issueReport = findIssueReportById(id);
        TechnicianMember technicianMember = technicianMemberService.resolveTechnicianMember(technicianId);
        String normalizedTechnicianId = technicianMember.getId();

        if (!technicianMember.isActive()) {
            throw new ResourceConflictException("Cannot assign an inactive technician");
        }

        boolean reassigned = issueReport.getAssignedTo() == null || !issueReport.getAssignedTo().equals(normalizedTechnicianId);

        issueReport.setAssignedTo(normalizedTechnicianId);
        if (reassigned) {
            issueReport.setAssignedAt(Instant.now());
            issueReport.setStudentFeedbackRating(null);
            issueReport.setStudentFeedbackComment(null);
            issueReport.setStudentFeedbackSubmittedAt(null);
        }
        if ("OPEN".equals(issueReport.getStatus())) {
            issueReport.setStatus("IN_PROGRESS");
        }
        issueReport.setUpdatedAt(Instant.now());

        IssueReport saved = issueReportRepository.save(issueReport);
        
        userRepository.findAll().stream()
            .filter(u -> u.getEmail().equalsIgnoreCase(technicianMember.getEmail()) && u.getRole() == Role.TECHNICIAN)
            .findFirst()
            .ifPresent(user -> {
                notificationService.send(user.getId(), "Ticket Assigned", "You have been assigned a new ticket: " + saved.getTitle(), "TICKETS", saved.getId());
            });

        return toResponse(saved);
    }

    public IssueReportResponse updateIssueReportAdminNote(String id, String adminNote) {
        IssueReport issueReport = findIssueReportById(id);
        issueReport.setAdminNote(adminNote.trim());
        issueReport.setUpdatedAt(Instant.now());

        return toResponse(issueReportRepository.save(issueReport));
    }

    public IssueReportResponse updateIssueReportStudentFeedback(
            String id,
            Integer feedbackRating,
            String feedbackComment,
            User user) {
        IssueReport issueReport = findIssueReportById(id);

        if (user.getRole() != Role.ADMIN
                && !issueReport.getStudentId().equals(user.getId())
                && !issueReport.getStudentEmail().equalsIgnoreCase(user.getEmail())) {
            throw new ResourceConflictException("You can only submit feedback for your own tickets");
        }

        if (issueReport.getAssignedTo() == null || issueReport.getAssignedTo().isBlank()) {
            throw new ResourceConflictException("Feedback can only be submitted after a technician is assigned");
        }

        if (!Set.of("RESOLVED", "CLOSED").contains(issueReport.getStatus())) {
            throw new ResourceConflictException("Feedback can only be submitted after the ticket is resolved");
        }

        issueReport.setStudentFeedbackRating(feedbackRating);
        issueReport.setStudentFeedbackComment(normalizeOptionalValue(feedbackComment));
        issueReport.setStudentFeedbackSubmittedAt(Instant.now());
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
                .registrationNumber(issueReport.getRegistrationNumber())
                .faculty(issueReport.getFaculty())
                .contactNumber(issueReport.getContactNumber())
                .requestType(issueReport.getRequestType())
                .requestSubType(issueReport.getRequestSubType())
                .department(issueReport.getDepartment())
                .attachmentUrls(issueReport.getAttachmentUrls())
                .assignedTo(issueReport.getAssignedTo())
                .assignedAt(issueReport.getAssignedAt())
                .adminNote(issueReport.getAdminNote())
                .rejectionReason(issueReport.getRejectionReason())
                .studentFeedbackRating(issueReport.getStudentFeedbackRating())
                .studentFeedbackComment(issueReport.getStudentFeedbackComment())
                .studentFeedbackSubmittedAt(issueReport.getStudentFeedbackSubmittedAt())
                .createdAt(issueReport.getCreatedAt())
                .updatedAt(issueReport.getUpdatedAt())
                .build();
    }

    private String normalizeOptionalValue(String value) {
        if (value == null) {
            return null;
        }

        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private Optional<TechnicianMember> selectBestActiveTechnician(IssueReport issueReport) {
        Coordinates incidentCoordinates = extractCoordinates(issueReport.getLocation());

        return technicianMemberRepository.findAll().stream()
                .filter(TechnicianMember::isActive)
                .map(technician -> new TechnicianDispatchCandidate(
                        technician,
                        getActiveAssignmentLoad(technician),
                        getDistanceScore(technician, incidentCoordinates)))
                .min(Comparator
                        .comparingInt((TechnicianDispatchCandidate candidate) -> candidate.activeLoad() == 0 ? 0 : 1)
                        .thenComparingDouble(TechnicianDispatchCandidate::distanceScore)
                        .thenComparingInt(TechnicianDispatchCandidate::activeLoad)
                        .thenComparing(
                                candidate -> candidate.technician().getTrackingUpdatedAt(),
                                Comparator.nullsLast(Comparator.reverseOrder()))
                        .thenComparing(
                                candidate -> candidate.technician().getCreatedAt(),
                                Comparator.nullsLast(Comparator.naturalOrder())))
                .map(TechnicianDispatchCandidate::technician);
    }

    private double getDistanceScore(TechnicianMember technician, Coordinates incidentCoordinates) {
        if (incidentCoordinates == null
                || technician.getCurrentLatitude() == null
                || technician.getCurrentLongitude() == null) {
            return Double.MAX_VALUE;
        }

        return calculateDistanceKm(
                technician.getCurrentLatitude(),
                technician.getCurrentLongitude(),
                incidentCoordinates.latitude(),
                incidentCoordinates.longitude());
    }

    private int getActiveAssignmentLoad(TechnicianMember technician) {
        return (int) issueReportRepository.findByAssignedToOrderByCreatedAtDesc(technician.getId()).stream()
                .filter(ticket -> !Set.of("RESOLVED", "CLOSED", "REJECTED").contains(ticket.getStatus()))
                .count();
    }

    private Coordinates extractCoordinates(String location) {
        if (location == null || location.isBlank()) {
            return null;
        }

        Matcher matcher = COORDINATE_PATTERN.matcher(location);
        if (!matcher.find()) {
            return null;
        }

        try {
            return new Coordinates(
                    Double.parseDouble(matcher.group(1)),
                    Double.parseDouble(matcher.group(2)));
        } catch (NumberFormatException ignored) {
            return null;
        }
    }

    private double calculateDistanceKm(double startLat, double startLng, double endLat, double endLng) {
        double earthRadiusKm = 6371.0;
        double deltaLat = Math.toRadians(endLat - startLat);
        double deltaLng = Math.toRadians(endLng - startLng);
        double startLatRadians = Math.toRadians(startLat);
        double endLatRadians = Math.toRadians(endLat);

        double a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2)
                + Math.cos(startLatRadians) * Math.cos(endLatRadians)
                        * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);

        return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    private record Coordinates(double latitude, double longitude) {
    }

    private record TechnicianDispatchCandidate(
            TechnicianMember technician,
            int activeLoad,
            double distanceScore) {
    }
}
