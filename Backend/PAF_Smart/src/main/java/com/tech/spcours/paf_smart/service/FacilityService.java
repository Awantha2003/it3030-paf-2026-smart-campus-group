package com.tech.spcours.paf_smart.service;

import java.time.Instant;
import java.util.List;

import org.springframework.stereotype.Service;

import com.tech.spcours.paf_smart.dto.CreateFacilityRequest;
import com.tech.spcours.paf_smart.dto.FacilityResponse;
import com.tech.spcours.paf_smart.exception.ResourceConflictException;
import com.tech.spcours.paf_smart.exception.ResourceNotFoundException;
import com.tech.spcours.paf_smart.model.Facility;
import com.tech.spcours.paf_smart.repository.FacilityRepository;
import com.tech.spcours.paf_smart.repository.EquipmentRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class FacilityService {

    private final FacilityRepository facilityRepository;
    private final EquipmentRepository equipmentRepository;

    public List<FacilityResponse> getAllFacilities() {
        return facilityRepository.findAll().stream()
                .map(this::mapToResponse)
                .toList();
    }

    public FacilityResponse getFacilityByCode(String code) {
        return facilityRepository.findByCode(code)
                .map(this::mapToResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Facility not found with code: " + code));
    }

    public FacilityResponse createFacility(CreateFacilityRequest request) {
        if (facilityRepository.existsByCode(request.code())) {
            throw new ResourceConflictException("Facility with code " + request.code() + " already exists");
        }

        Instant now = Instant.now();
        Facility facility = Facility.builder()
                .code(request.code().trim().toUpperCase())
                .name(request.name().trim())
                .building(request.building().trim())
                .block(request.block().trim())
                .floor(request.floor())
                .spaceType(request.spaceType().trim())
                .capacity(request.capacity())
                .description(request.description())
                .amenities(request.amenities())
                .imageUrl(request.imageUrl())
                .status("OPERATIONAL")
                .createdAt(now)
                .updatedAt(now)
                .build();

        return mapToResponse(facilityRepository.save(facility));
    }

    public FacilityResponse updateFacility(String id, CreateFacilityRequest request) {
        Facility facility = facilityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Facility not found with id: " + id));

        // If code is changed, check if new code already exists
        if (!facility.getCode().equalsIgnoreCase(request.code()) && facilityRepository.existsByCode(request.code())) {
            throw new ResourceConflictException("Facility with code " + request.code() + " already exists");
        }

        facility.setCode(request.code().trim().toUpperCase());
        facility.setName(request.name().trim());
        facility.setBuilding(request.building().trim());
        facility.setBlock(request.block().trim());
        facility.setFloor(request.floor());
        facility.setSpaceType(request.spaceType().trim());
        facility.setCapacity(request.capacity());
        facility.setDescription(request.description());
        facility.setAmenities(request.amenities());
        facility.setImageUrl(request.imageUrl());
        facility.setUpdatedAt(Instant.now());

        return mapToResponse(facilityRepository.save(facility));
    }

    public void deleteFacility(String id) {
        if (!facilityRepository.existsById(id)) {
            throw new ResourceNotFoundException("Facility not found with id: " + id);
        }
        facilityRepository.deleteById(id);
    }

    public java.util.Map<String, Long> getResourceSummary() {
        java.util.Map<String, Long> summary = new java.util.HashMap<>();
        
        // Count facilities by their type grouping
        List<Facility> allFacilities = facilityRepository.findAll();
        
        long facilityCount = allFacilities.stream()
            .filter(f -> List.of("LECTURE_HALL", "LAB", "MEETING_ROOM", "AUDITORIUM").contains(f.getSpaceType()))
            .count();
            
        long sportsCount = allFacilities.stream()
            .filter(f -> "SPORTS_VENUE".equals(f.getSpaceType()))
            .count();
            
        long libraryCount = allFacilities.stream()
            .filter(f -> "LIBRARY_ZONE".equals(f.getSpaceType()))
            .count();
            
        long eventCount = allFacilities.stream()
            .filter(f -> "SEMINAR_ROOM".equals(f.getSpaceType()))
            .count();

        summary.put("FACILITY", facilityCount);
        summary.put("SPORTS", sportsCount);
        summary.put("LIBRARY", libraryCount);
        summary.put("EVENT", eventCount);
        
        // Total count of unique equipment types
        summary.put("EQUIPMENT", equipmentRepository.count());
        
        return summary;
    }

    private FacilityResponse mapToResponse(Facility facility) {
        return FacilityResponse.builder()
                .id(facility.getId())
                .code(facility.getCode())
                .name(facility.getName())
                .building(facility.getBuilding())
                .block(facility.getBlock())
                .floor(facility.getFloor())
                .spaceType(facility.getSpaceType())
                .capacity(facility.getCapacity())
                .description(facility.getDescription())
                .amenities(facility.getAmenities())
                .imageUrl(facility.getImageUrl())
                .status(facility.getStatus())
                .createdAt(facility.getCreatedAt())
                .updatedAt(facility.getUpdatedAt())
                .build();
    }
}
