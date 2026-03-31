package com.tech.spcours.paf_smart.service;

import java.time.Instant;
import java.util.List;

import org.springframework.stereotype.Service;

import com.tech.spcours.paf_smart.dto.CreateTechnicianRequest;
import com.tech.spcours.paf_smart.dto.TechnicianResponse;
import com.tech.spcours.paf_smart.exception.ResourceConflictException;
import com.tech.spcours.paf_smart.model.TechnicianMember;
import com.tech.spcours.paf_smart.repository.TechnicianMemberRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TechnicianMemberService {

    private final TechnicianMemberRepository technicianMemberRepository;

    public List<TechnicianResponse> getAllTechnicians() {
        return technicianMemberRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public TechnicianResponse createTechnician(CreateTechnicianRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();

        technicianMemberRepository.findByEmailIgnoreCase(normalizedEmail).ifPresent(existing -> {
            throw new ResourceConflictException("A technician with this email already exists");
        });

        Instant now = Instant.now();
        TechnicianMember technicianMember = TechnicianMember.builder()
                .fullName(request.getFullName().trim())
                .email(normalizedEmail)
                .phone(request.getPhone().trim())
                .department(request.getDepartment().trim())
                .specialization(request.getSpecialization().trim())
                .active(true)
                .createdAt(now)
                .updatedAt(now)
                .build();

        TechnicianMember savedTechnician = technicianMemberRepository.save(technicianMember);
        return toResponse(savedTechnician);
    }

    private TechnicianResponse toResponse(TechnicianMember technicianMember) {
        return TechnicianResponse.builder()
                .id(technicianMember.getId())
                .fullName(technicianMember.getFullName())
                .email(technicianMember.getEmail())
                .phone(technicianMember.getPhone())
                .department(technicianMember.getDepartment())
                .specialization(technicianMember.getSpecialization())
                .active(technicianMember.isActive())
                .createdAt(technicianMember.getCreatedAt())
                .updatedAt(technicianMember.getUpdatedAt())
                .build();
    }
}
