package com.tech.spcours.paf_smart.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.tech.spcours.paf_smart.dto.CreateTechnicianRequest;
import com.tech.spcours.paf_smart.dto.TechnicianResponse;
import com.tech.spcours.paf_smart.service.TechnicianMemberService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/technicians")
@RequiredArgsConstructor
public class TechnicianMemberController {

    private final TechnicianMemberService technicianMemberService;

    @GetMapping
    public List<TechnicianResponse> getTechnicians() {
        return technicianMemberService.getAllTechnicians();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TechnicianResponse createTechnician(@Valid @RequestBody CreateTechnicianRequest request) {
        return technicianMemberService.createTechnician(request);
    }
}
