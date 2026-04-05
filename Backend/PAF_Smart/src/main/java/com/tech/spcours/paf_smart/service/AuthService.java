package com.tech.spcours.paf_smart.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.tech.spcours.paf_smart.dto.AuthUserResponse;
import com.tech.spcours.paf_smart.dto.LoginRequest;
import com.tech.spcours.paf_smart.dto.LoginResponse;
import com.tech.spcours.paf_smart.exception.UnauthorizedException;
import com.tech.spcours.paf_smart.model.TechnicianMember;
import com.tech.spcours.paf_smart.repository.TechnicianMemberRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

    private static final String ADMIN_EMAIL = "admin@gmail.com";
    private static final String ADMIN_PASSWORD = "Admin123@";

    private final TechnicianMemberRepository technicianMemberRepository;
    private final PasswordEncoder passwordEncoder;

    public LoginResponse loginAdmin(LoginRequest request) {
        String username = request.getUsername().trim().toLowerCase();

        if (!ADMIN_EMAIL.equals(username) || !ADMIN_PASSWORD.equals(request.getPassword())) {
            throw new UnauthorizedException("Invalid admin email or password");
        }

        return LoginResponse.builder()
                .message("Admin login successful")
                .user(AuthUserResponse.builder()
                        .id("admin-001")
                        .name("System Admin")
                        .email(ADMIN_EMAIL)
                        .role("ADMIN")
                        .department("Administration")
                        .specialization("Campus Operations")
                        .build())
                .build();
    }

    public LoginResponse loginTechnician(LoginRequest request) {
        String username = request.getUsername().trim().toLowerCase();

        TechnicianMember technicianMember = technicianMemberRepository.findByEmailIgnoreCase(username)
                .orElseThrow(() -> new UnauthorizedException("Invalid username or password"));

        if (!technicianMember.isActive()) {
            throw new UnauthorizedException("This technician account is inactive");
        }

        if (!passwordEncoder.matches(request.getPassword().trim(), technicianMember.getPasswordHash())) {
            throw new UnauthorizedException("Invalid username or password");
        }

        return LoginResponse.builder()
                .message("Login successful")
                .user(AuthUserResponse.builder()
                        .id(technicianMember.getId())
                        .name(technicianMember.getFullName())
                        .email(technicianMember.getEmail())
                        .role("TECHNICIAN")
                        .department(technicianMember.getDepartment())
                        .specialization(technicianMember.getSpecialization())
                        .build())
                .build();
    }
}
