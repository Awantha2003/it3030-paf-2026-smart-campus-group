package com.tech.spcours.paf_smart.service;

import java.time.Instant;
import java.util.List;

import org.springframework.stereotype.Service;

import com.tech.spcours.paf_smart.dto.CreateEquipmentRequest;
import com.tech.spcours.paf_smart.dto.EquipmentResponse;
import com.tech.spcours.paf_smart.exception.ResourceNotFoundException;
import com.tech.spcours.paf_smart.model.Equipment;
import com.tech.spcours.paf_smart.repository.EquipmentRepository;
import com.tech.spcours.paf_smart.repository.FacilityRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EquipmentService {

    private final EquipmentRepository equipmentRepository;
    private final FacilityRepository facilityRepository;

    public List<EquipmentResponse> getEquipmentsByFacility(String facilityId) {
        return equipmentRepository.findByFacilityId(facilityId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    public EquipmentResponse createEquipment(CreateEquipmentRequest request) {
        if (!facilityRepository.existsById(request.facilityId())) {
            throw new ResourceNotFoundException("Target facility not found");
        }

        Instant now = Instant.now();
        Equipment equipment = Equipment.builder()
                .facilityId(request.facilityId())
                .name(request.name().trim())
                .description(request.description())
                .totalQuantity(request.totalQuantity())
                .availableQuantity(request.totalQuantity())
                .approvalRequired(request.approvalRequired())
                .imageUrl(request.imageUrl())
                .status("OPERATIONAL")
                .createdAt(now)
                .updatedAt(now)
                .build();

        return mapToResponse(equipmentRepository.save(equipment));
    }

    public EquipmentResponse updateEquipment(String id, CreateEquipmentRequest request) {
        Equipment equipment = equipmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Equipment not found"));

        int borrowed = equipment.getTotalQuantity() - equipment.getAvailableQuantity();
        
        equipment.setName(request.name().trim());
        equipment.setDescription(request.description());
        equipment.setTotalQuantity(request.totalQuantity());
        // Simple logic: if total increases, available increases by same amount
        equipment.setAvailableQuantity(Math.max(0, request.totalQuantity() - borrowed));
        equipment.setApprovalRequired(request.approvalRequired());
        equipment.setImageUrl(request.imageUrl());
        equipment.setUpdatedAt(Instant.now());

        return mapToResponse(equipmentRepository.save(equipment));
    }

    public void updateStatus(String id, String status) {
        Equipment equipment = equipmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Equipment not found"));
        equipment.setStatus(status);
        equipment.setUpdatedAt(Instant.now());
        equipmentRepository.save(equipment);
    }

    public void deleteEquipment(String id) {
        if (!equipmentRepository.existsById(id)) {
            throw new ResourceNotFoundException("Equipment not found");
        }
        equipmentRepository.deleteById(id);
    }

    private EquipmentResponse mapToResponse(Equipment equipment) {
        return EquipmentResponse.builder()
                .id(equipment.getId())
                .facilityId(equipment.getFacilityId())
                .name(equipment.getName())
                .description(equipment.getDescription())
                .totalQuantity(equipment.getTotalQuantity())
                .availableQuantity(equipment.getAvailableQuantity())
                .status(equipment.getStatus())
                .approvalRequired(equipment.isApprovalRequired())
                .imageUrl(equipment.getImageUrl())
                .createdAt(equipment.getCreatedAt())
                .updatedAt(equipment.getUpdatedAt())
                .build();
    }
}
