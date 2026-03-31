package com.tech.spcours.paf_smart.service;

import java.time.Instant;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;

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
    private final PasswordEncoder passwordEncoder;
    private final MailjetEmailService mailjetEmailService;

    public List<TechnicianResponse> getAllTechnicians() {
        return technicianMemberRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public TechnicianResponse createTechnician(CreateTechnicianRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();
        String rawPassword = request.getPassword().trim();

        technicianMemberRepository.findByEmailIgnoreCase(normalizedEmail).ifPresent(existing -> {
            throw new ResourceConflictException("A technician with this email already exists");
        });

        Instant now = Instant.now();
        TechnicianMember technicianMember = TechnicianMember.builder()
                .fullName(request.getFullName().trim())
                .email(normalizedEmail)
                .passwordHash(passwordEncoder.encode(rawPassword))
                .phone(request.getPhone().trim())
                .department(request.getDepartment().trim())
                .specialization(request.getSpecialization().trim())
                .active(true)
                .createdAt(now)
                .updatedAt(now)
                .build();

        TechnicianMember savedTechnician = technicianMemberRepository.save(technicianMember);
        EmailDeliveryResult emailDeliveryResult =
                mailjetEmailService.sendTechnicianCredentialsEmail(savedTechnician, rawPassword);
        return toResponse(savedTechnician, emailDeliveryResult);
    }

    private TechnicianResponse toResponse(TechnicianMember technicianMember) {
        return toResponse(technicianMember, EmailDeliveryResult.failed("Credentials email status unavailable"));
    }

    private TechnicianResponse toResponse(TechnicianMember technicianMember, EmailDeliveryResult emailDeliveryResult) {
        return TechnicianResponse.builder()
                .id(technicianMember.getId())
                .fullName(technicianMember.getFullName())
                .email(technicianMember.getEmail())
                .phone(technicianMember.getPhone())
                .department(technicianMember.getDepartment())
                .specialization(technicianMember.getSpecialization())
                .active(technicianMember.isActive())
                .credentialsEmailSent(emailDeliveryResult.sent())
                .credentialsEmailStatus(emailDeliveryResult.message())
                .createdAt(technicianMember.getCreatedAt())
                .updatedAt(technicianMember.getUpdatedAt())
                .build();
    }
}
