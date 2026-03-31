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

    private final TechnicianMemberRepository technicianMemberRepository;
    private final PasswordEncoder passwordEncoder;

    public LoginResponse loginTechnician(LoginRequest request) {
        String username = request.getUsername().trim().toLowerCase();

        TechnicianMember technicianMember = technicianMemberRepository.findByEmailIgnoreCase(username)
                .orElseThrow(() -> new UnauthorizedException("Invalid username or password"));

        if (!technicianMember.isActive()) {
            throw new UnauthorizedException("This technician account is inactive");
        }

        if (!passwordEncoder.matches(request.getPassword(), technicianMember.getPasswordHash())) {
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
