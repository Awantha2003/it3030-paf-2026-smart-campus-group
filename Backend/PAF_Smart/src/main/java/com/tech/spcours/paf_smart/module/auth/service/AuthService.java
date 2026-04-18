package com.tech.spcours.paf_smart.module.auth.service;

import com.tech.spcours.paf_smart.module.auth.dto.*;
import com.tech.spcours.paf_smart.security.JwtTokenProvider;
import com.tech.spcours.paf_smart.module.user.model.Role;
import com.tech.spcours.paf_smart.module.user.model.User;
import com.tech.spcours.paf_smart.module.user.repository.UserRepository;
import com.tech.spcours.paf_smart.module.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;
    private final NotificationService notificationService;

    @org.springframework.beans.factory.annotation.Value("${app.auth.admin-registration-code}")
    private String adminCode;

    @org.springframework.beans.factory.annotation.Value("${app.auth.sub-admin-registration-code}")
    private String technicianCode;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already in use");
        }

        Role assignedRole = Role.USER;
        boolean isEnabled = true;

        if ("ADMIN".equalsIgnoreCase(request.getRole())) {
            assignedRole = Role.ADMIN;
        } else if ("TECHNICIAN".equalsIgnoreCase(request.getRole())) {
            if (!request.getEmail().toLowerCase().matches("^[a-z0-9._%+-]+\\.tech@gmail\\.com$")) {
                throw new RuntimeException("Technician email must be in the format: username.tech@gmail.com");
            }
            assignedRole = Role.TECHNICIAN;
            isEnabled = false; // Requires admin approval
        }



        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(assignedRole)
                .provider("local")
                .enabled(isEnabled)
                .build();

        userRepository.save(user);

        // REQUIREMENT: when new user registered into system, Admin should get a notification
        java.util.List<User> admins = userRepository.findByRole(Role.ADMIN);
        for (User admin : admins) {
            notificationService.send(
                    admin.getId(),
                    "New User Registration",
                    user.getName() + " (" + user.getEmail() + ") has registered with role: " + assignedRole,
                    "SYSTEM",
                    user.getId()
            );
        }

        // REQUIREMENT: user should get a pop up message (handled on frontend), and login notification
        notificationService.send(
            user.getId(),
            "Welcome to Smart Campus",
            "Your account registration was successful. Welcome aboard!",
            "SYSTEM",
            user.getId()
        );

        if (!user.isEnabled()) {
            return AuthResponse.builder()
                    .status("PENDING_APPROVAL")
                    .userId(user.getId())
                    .name(user.getName())
                    .email(user.getEmail())
                    .role(user.getRole().name())
                    .build();
        }

        String token = jwtTokenProvider.generateToken(user);
        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
        } catch (DisabledException e) {
            throw new RuntimeException("Your account is pending admin approval. Please contact an administrator.");
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        boolean isHighPrivilege = user.getRole() == Role.ADMIN || user.getRole() == Role.TECHNICIAN;

        if (isHighPrivilege && !user.isMfaEnabled()) {
            return AuthResponse.builder()
                    .status("MFA_SETUP_REQUIRED")
                    .userId(user.getId())
                    .build();
        }

        if (user.isMfaEnabled()) {
            return AuthResponse.builder()
                    .status("MFA_CODE_REQUIRED")
                    .userId(user.getId())
                    .build();
        }

        String token = jwtTokenProvider.generateToken(user);
        
        notificationService.send(
            user.getId(),
            "Login Success",
            "A successful login was recorded for your account via Password.",
            "SYSTEM",
            user.getId()
        );

        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }
}
