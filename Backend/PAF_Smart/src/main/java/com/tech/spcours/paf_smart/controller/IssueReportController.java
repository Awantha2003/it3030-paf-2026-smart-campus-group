package com.tech.spcours.paf_smart.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.tech.spcours.paf_smart.dto.AssignIssueReportRequest;
import com.tech.spcours.paf_smart.dto.CreateIssueReportRequest;
import com.tech.spcours.paf_smart.dto.IssueReportResponse;
import com.tech.spcours.paf_smart.dto.UpdateIssueReportFeedbackRequest;
import com.tech.spcours.paf_smart.dto.UpdateIssueReportNoteRequest;
import com.tech.spcours.paf_smart.dto.UpdateIssueReportStatusRequest;
import com.tech.spcours.paf_smart.module.user.model.User;
import com.tech.spcours.paf_smart.service.IssueReportService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/issues")
@RequiredArgsConstructor
public class IssueReportController {

    private final IssueReportService issueReportService;

    // Create a new ticket from the student side.
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public IssueReportResponse createIssueReport(@Valid @RequestBody CreateIssueReportRequest request) {
        return issueReportService.createIssueReport(request);
    }

    // Get all tickets created by one student.
    @GetMapping
    public List<IssueReportResponse> getStudentIssueReports(@RequestParam String studentId) {
        return issueReportService.getStudentIssueReports(studentId);
    }

    // Get all tickets assigned to one technician.
    @GetMapping("/technician")
    public List<IssueReportResponse> getTechnicianIssueReports(@RequestParam String technicianId) {
        return issueReportService.getTechnicianIssueReports(technicianId);
    }

    // Get full details of one ticket by its id.
    @GetMapping("/{id}")
    public IssueReportResponse getIssueReportById(@PathVariable String id) {
        return issueReportService.getIssueReportById(id);
    }

    // Let the student submit feedback after the ticket is handled.
    @PatchMapping("/{id}/feedback")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public IssueReportResponse updateIssueReportFeedback(
            @PathVariable String id,
            @Valid @RequestBody UpdateIssueReportFeedbackRequest request,
            org.springframework.security.core.Authentication auth) {
        User user = (User) auth.getPrincipal();
        return issueReportService.updateIssueReportStudentFeedback(
                id,
                request.feedbackRating(),
                request.feedbackComment(),
                user);
    }

    // Admin view: load every ticket in the system.
    @GetMapping("/admin/all")
    public List<IssueReportResponse> getAllIssueReports() {
        return issueReportService.getAllIssueReports();
    }

    // Admin view: change ticket status such as OPEN or RESOLVED.
    @PatchMapping("/admin/{id}/status")
    public IssueReportResponse updateIssueReportStatus(
            @PathVariable String id,
            @Valid @RequestBody UpdateIssueReportStatusRequest request) {
        return issueReportService.updateIssueReportStatus(id, request.status(), request.rejectionReason());
    }

    // Admin view: assign a technician to a ticket.
    @PatchMapping("/admin/{id}/assign")
    public IssueReportResponse assignIssueReport(
            @PathVariable String id,
            @Valid @RequestBody AssignIssueReportRequest request) {
        return issueReportService.assignIssueReport(id, request.technicianId());
    }

    // Admin view: save an internal note for the ticket.
    @PatchMapping("/admin/{id}/note")
    public IssueReportResponse updateIssueReportAdminNote(
            @PathVariable String id,
            @Valid @RequestBody UpdateIssueReportNoteRequest request) {
        return issueReportService.updateIssueReportAdminNote(id, request.adminNote());
    }
}
