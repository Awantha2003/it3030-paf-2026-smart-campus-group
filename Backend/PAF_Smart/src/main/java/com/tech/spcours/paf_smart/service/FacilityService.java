package com.tech.spcours.paf_smart.service;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

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

    private static final Set<String> FACILITY_CATEGORY_TYPES = Set.of(
            "FACILITY",
            "LECTURE_HALL",
            "LAB",
            "MEETING_ROOM",
            "AUDITORIUM");

    private static final Set<String> SPORTS_CATEGORY_TYPES = Set.of(
            "SPORTS",
            "SPORTS_VENUE");

    private static final Set<String> LIBRARY_CATEGORY_TYPES = Set.of(
            "LIBRARY",
            "LIBRARY_ZONE");

    private static final Set<String> EVENT_CATEGORY_TYPES = Set.of(
            "EVENT",
            "SEMINAR_ROOM");

    private final FacilityRepository facilityRepository;
    private final EquipmentRepository equipmentRepository;

    public List<FacilityResponse> getAllFacilities() {
        return facilityRepository.findAll().stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<FacilityResponse> getFacilitiesByType(String type) {
        String normalizedType = normalizeResourceType(type);
        return facilityRepository.findAll().stream()
                .filter(facility -> normalizedType.equals(resolveResourceCategory(facility.getSpaceType())))
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
                .spaceType(normalizeResourceType(request.spaceType()))
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
        facility.setSpaceType(normalizeResourceType(request.spaceType()));
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

    public Map<String, Long> getResourceSummary() {
        Map<String, Long> summary = new HashMap<>();
        summary.put("FACILITY", 0L);
        summary.put("SPORTS", 0L);
        summary.put("LIBRARY", 0L);
        summary.put("EVENT", 0L);

        List<Facility> allFacilities = facilityRepository.findAll();

        for (Facility facility : allFacilities) {
            String category = resolveResourceCategory(facility.getSpaceType());
            summary.merge(category, 1L, Long::sum);
        }

        summary.put("EQUIPMENT", equipmentRepository.count());

        return summary;
    }

    private String normalizeResourceType(String rawType) {
        if (rawType == null || rawType.isBlank()) {
            return "FACILITY";
        }
        return resolveResourceCategory(rawType.trim().toUpperCase());
    }

    private String resolveResourceCategory(String rawSpaceType) {
        if (rawSpaceType == null || rawSpaceType.isBlank()) {
            return "FACILITY";
        }

        String normalized = rawSpaceType.trim().toUpperCase();

        if (SPORTS_CATEGORY_TYPES.contains(normalized)) {
            return "SPORTS";
        }
        if (LIBRARY_CATEGORY_TYPES.contains(normalized)) {
            return "LIBRARY";
        }
        if (EVENT_CATEGORY_TYPES.contains(normalized)) {
            return "EVENT";
        }
        if (FACILITY_CATEGORY_TYPES.contains(normalized)) {
            return "FACILITY";
        }

        // Default unknown legacy values to FACILITY to avoid hiding data.
        return "FACILITY";
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
