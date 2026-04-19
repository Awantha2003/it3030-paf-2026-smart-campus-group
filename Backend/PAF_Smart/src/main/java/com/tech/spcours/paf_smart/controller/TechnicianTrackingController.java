package com.tech.spcours.paf_smart.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tech.spcours.paf_smart.dto.TechnicianResponse;
import com.tech.spcours.paf_smart.dto.UpdateTechnicianLocationRequest;
import com.tech.spcours.paf_smart.service.TechnicianMemberService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/technicians")
@RequiredArgsConstructor
public class TechnicianTrackingController {

    private final TechnicianMemberService technicianMemberService;

    @GetMapping("/{id}")
    public TechnicianResponse getTechnician(@PathVariable String id) {
        return technicianMemberService.getTechnicianById(id);
    }

    @PatchMapping("/{id}/location")
    public TechnicianResponse updateTechnicianLocation(
            @PathVariable String id,
            @Valid @RequestBody UpdateTechnicianLocationRequest request) {
        return technicianMemberService.updateTechnicianLocation(id, request);
    }
}
