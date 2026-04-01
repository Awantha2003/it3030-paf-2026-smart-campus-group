package com.tech.spcours.paf_smart.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.tech.spcours.paf_smart.dto.CreateIssueReportRequest;
import com.tech.spcours.paf_smart.dto.IssueReportResponse;
import com.tech.spcours.paf_smart.service.IssueReportService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/issues")
@RequiredArgsConstructor
public class IssueReportController {

    private final IssueReportService issueReportService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public IssueReportResponse createIssueReport(@Valid @RequestBody CreateIssueReportRequest request) {
        return issueReportService.createIssueReport(request);
    }

    @GetMapping
    public List<IssueReportResponse> getStudentIssueReports(@RequestParam String studentId) {
        return issueReportService.getStudentIssueReports(studentId);
    }

    @GetMapping("/{id}")
    public IssueReportResponse getIssueReportById(@PathVariable String id) {
        return issueReportService.getIssueReportById(id);
    }
}
