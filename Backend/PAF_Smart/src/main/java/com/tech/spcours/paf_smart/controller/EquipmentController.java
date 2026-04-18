package com.tech.spcours.paf_smart.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.tech.spcours.paf_smart.dto.CreateEquipmentRequest;
import com.tech.spcours.paf_smart.dto.EquipmentResponse;
import com.tech.spcours.paf_smart.service.EquipmentService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/equipments")
@RequiredArgsConstructor
public class EquipmentController {

    private final EquipmentService equipmentService;

    @GetMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public List<EquipmentResponse> getAllEquipments() {
        return equipmentService.getAllEquipments();
    }

    @GetMapping("/facility/{facilityId}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public List<EquipmentResponse> getEquipmentsByFacility(@PathVariable String facilityId) {
        return equipmentService.getEquipmentsByFacility(facilityId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    public EquipmentResponse createEquipment(@Valid @RequestBody CreateEquipmentRequest request) {
        return equipmentService.createEquipment(request);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public EquipmentResponse updateEquipment(
            @PathVariable String id,
            @Valid @RequestBody CreateEquipmentRequest request) {
        return equipmentService.updateEquipment(id, request);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public void updateStatus(@PathVariable String id, @RequestParam String status) {
        equipmentService.updateStatus(id, status);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteEquipment(@PathVariable String id) {
        equipmentService.deleteEquipment(id);
    }
}
