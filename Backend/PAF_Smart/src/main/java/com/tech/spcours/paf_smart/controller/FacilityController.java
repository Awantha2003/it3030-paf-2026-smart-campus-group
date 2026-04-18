package com.tech.spcours.paf_smart.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.tech.spcours.paf_smart.dto.CreateFacilityRequest;
import com.tech.spcours.paf_smart.dto.FacilityResponse;
import com.tech.spcours.paf_smart.service.FacilityService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/facilities")
@RequiredArgsConstructor
public class FacilityController {

    private final FacilityService facilityService;

    @GetMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public List<FacilityResponse> getAllFacilities() {
        return facilityService.getAllFacilities();
    }

    @GetMapping("/summary")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public java.util.Map<String, Long> getResourceSummary() {
        return facilityService.getResourceSummary();
    }

    @GetMapping("/{code}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public FacilityResponse getFacilityByCode(@PathVariable String code) {
        return facilityService.getFacilityByCode(code);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    public FacilityResponse createFacility(@Valid @RequestBody CreateFacilityRequest request) {
        return facilityService.createFacility(request);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public FacilityResponse updateFacility(
            @PathVariable String id,
            @Valid @RequestBody CreateFacilityRequest request) {
        return facilityService.updateFacility(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteFacility(@PathVariable String id) {
        facilityService.deleteFacility(id);
    }
}
