package com.tech.spcours.paf_smart.service;

import java.time.Instant;
import java.util.List;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.tech.spcours.paf_smart.dto.CreateTechnicianRequest;
import com.tech.spcours.paf_smart.dto.TechnicianResponse;
import com.tech.spcours.paf_smart.dto.UpdateTechnicianLocationRequest;
import com.tech.spcours.paf_smart.exception.ResourceConflictException;
import com.tech.spcours.paf_smart.exception.ResourceNotFoundException;
import com.tech.spcours.paf_smart.model.TechnicianMember;
import com.tech.spcours.paf_smart.module.user.model.Role;
import com.tech.spcours.paf_smart.module.user.model.User;
import com.tech.spcours.paf_smart.module.user.repository.UserRepository;
import com.tech.spcours.paf_smart.repository.TechnicianMemberRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TechnicianMemberService {

    private final TechnicianMemberRepository technicianMemberRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final MailjetEmailService mailjetEmailService;

    public List<TechnicianResponse> getAllTechnicians() {
        synchronizeTechnicianAccounts();
        return technicianMemberRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public TechnicianResponse getTechnicianById(String id) {
        return toResponse(resolveTechnicianMember(id));
    }

    public TechnicianMember resolveTechnicianMember(String id) {
        return findTechnicianByIdOrUser(id);
    }

    public TechnicianMember syncTechnicianAccount(User user) {
        if (user.getRole() != Role.TECHNICIAN) {
            throw new ResourceConflictException("User is not assigned to the technician role");
        }

        return upsertTechnicianMemberFromUser(user);
    }

    public void deactivateLinkedTechnicianAccount(User user) {
        technicianMemberRepository.findByEmailIgnoreCase(normalizeEmail(user.getEmail()))
                .ifPresent(technicianMember -> {
                    technicianMember.setActive(false);
                    technicianMember.setUpdatedAt(Instant.now());
                    technicianMemberRepository.save(technicianMember);
                });
    }

    public TechnicianResponse createTechnician(CreateTechnicianRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();
        String rawPassword = request.getPassword().trim();

        technicianMemberRepository.findByEmailIgnoreCase(normalizedEmail).ifPresent(existing -> {
            throw new ResourceConflictException("A technician with this email already exists");
        });
        userRepository.findByEmail(normalizedEmail).ifPresent(existing -> {
            throw new ResourceConflictException("A user with this email already exists");
        });

        Instant now = Instant.now();
        String encodedPassword = passwordEncoder.encode(rawPassword);
        TechnicianMember technicianMember = TechnicianMember.builder()
                .fullName(request.getFullName().trim())
                .email(normalizedEmail)
                .passwordHash(encodedPassword)
                .phone(request.getPhone().trim())
                .department(request.getDepartment().trim())
                .specialization(request.getSpecialization().trim())
                .active(true)
                .createdAt(now)
                .updatedAt(now)
                .build();

        TechnicianMember savedTechnician = technicianMemberRepository.save(technicianMember);
        userRepository.save(User.builder()
                .name(savedTechnician.getFullName())
                .email(savedTechnician.getEmail())
                .password(encodedPassword)
                .role(Role.TECHNICIAN)
                .provider("local")
                .enabled(savedTechnician.isActive())
                .build());
        EmailDeliveryResult emailDeliveryResult =
                mailjetEmailService.sendTechnicianCredentialsEmail(savedTechnician, rawPassword);
        return toResponse(savedTechnician, emailDeliveryResult);
    }

    public TechnicianResponse updateTechnicianStatus(String id, boolean active) {
        TechnicianMember technicianMember = findTechnicianById(id);
        technicianMember.setActive(active);
        technicianMember.setUpdatedAt(Instant.now());
        TechnicianMember updatedTechnician = technicianMemberRepository.save(technicianMember);
        userRepository.findByEmail(updatedTechnician.getEmail()).ifPresent(user -> {
            user.setEnabled(active);
            userRepository.save(user);
        });
        return toResponse(updatedTechnician);
    }

    public TechnicianResponse updateTechnicianLocation(String id, UpdateTechnicianLocationRequest request) {
        TechnicianMember technicianMember = resolveTechnicianMember(id);
        Instant now = Instant.now();

        technicianMember.setCurrentLatitude(request.latitude());
        technicianMember.setCurrentLongitude(request.longitude());
        technicianMember.setCurrentLocation(request.location().trim());
        technicianMember.setTrackingUpdatedAt(now);
        technicianMember.setUpdatedAt(now);

        TechnicianMember updatedTechnician = technicianMemberRepository.save(technicianMember);
        return toResponse(updatedTechnician);
    }

    public void deleteTechnician(String id) {
        TechnicianMember technicianMember = findTechnicianById(id);
        userRepository.findByEmail(technicianMember.getEmail()).ifPresent(userRepository::delete);
        technicianMemberRepository.delete(technicianMember);
    }

    private void synchronizeTechnicianAccounts() {
        userRepository.findByRole(Role.TECHNICIAN)
                .forEach(this::upsertTechnicianMemberFromUser);
    }

    private TechnicianMember findTechnicianByIdOrUser(String id) {
        String normalizedId = id == null ? "" : id.trim();

        if (normalizedId.isBlank()) {
            throw new ResourceNotFoundException("Technician account not found");
        }

        return technicianMemberRepository.findById(normalizedId)
                .orElseGet(() -> userRepository.findById(normalizedId)
                        .filter(user -> user.getRole() == Role.TECHNICIAN)
                        .map(this::upsertTechnicianMemberFromUser)
                        .orElseThrow(() -> new ResourceNotFoundException("Technician account not found")));
    }

    private TechnicianMember findTechnicianById(String id) {
        return technicianMemberRepository.findById(id == null ? "" : id.trim())
                .orElseThrow(() -> new ResourceNotFoundException("Technician account not found"));
    }

    private TechnicianMember upsertTechnicianMemberFromUser(User user) {
        String normalizedEmail = normalizeEmail(user.getEmail());
        Instant now = Instant.now();

        TechnicianMember technicianMember = technicianMemberRepository.findByEmailIgnoreCase(normalizedEmail)
                .orElseGet(() -> TechnicianMember.builder()
                        .email(normalizedEmail)
                        .department("Registered Technician Account")
                        .specialization("General Support")
                        .createdAt(now)
                        .build());

        boolean changed = false;
        String displayName = normalizeDisplayName(user);

        if (!displayName.equals(technicianMember.getFullName())) {
            technicianMember.setFullName(displayName);
            changed = true;
        }

        if (!normalizedEmail.equalsIgnoreCase(technicianMember.getEmail())) {
            technicianMember.setEmail(normalizedEmail);
            changed = true;
        }

        if (user.getPassword() != null && !user.getPassword().isBlank()
                && !user.getPassword().equals(technicianMember.getPasswordHash())) {
            technicianMember.setPasswordHash(user.getPassword());
            changed = true;
        }

        if (technicianMember.isActive() != user.isEnabled()) {
            technicianMember.setActive(user.isEnabled());
            changed = true;
        }

        if (technicianMember.getDepartment() == null || technicianMember.getDepartment().isBlank()) {
            technicianMember.setDepartment("Registered Technician Account");
            changed = true;
        }

        if (technicianMember.getSpecialization() == null || technicianMember.getSpecialization().isBlank()) {
            technicianMember.setSpecialization("General Support");
            changed = true;
        }

        if (technicianMember.getCreatedAt() == null) {
            technicianMember.setCreatedAt(now);
            changed = true;
        }

        if (technicianMember.getId() == null || changed) {
            technicianMember.setUpdatedAt(now);
            return technicianMemberRepository.save(technicianMember);
        }

        return technicianMember;
    }

    private String normalizeEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase();
    }

    private String normalizeDisplayName(User user) {
        if (user.getName() != null && !user.getName().isBlank()) {
            return user.getName().trim();
        }

        return normalizeEmail(user.getEmail());
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
                .currentLatitude(technicianMember.getCurrentLatitude())
                .currentLongitude(technicianMember.getCurrentLongitude())
                .currentLocation(technicianMember.getCurrentLocation())
                .trackingUpdatedAt(technicianMember.getTrackingUpdatedAt())
                .credentialsEmailSent(emailDeliveryResult.sent())
                .credentialsEmailStatus(emailDeliveryResult.message())
                .createdAt(technicianMember.getCreatedAt())
                .updatedAt(technicianMember.getUpdatedAt())
                .build();
    }
}
