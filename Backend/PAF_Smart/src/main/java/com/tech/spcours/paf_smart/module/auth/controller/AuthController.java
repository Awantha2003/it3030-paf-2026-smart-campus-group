package com.tech.spcours.paf_smart.module.auth.controller;

import com.tech.spcours.paf_smart.module.auth.dto.*;
import com.tech.spcours.paf_smart.module.auth.service.AuthService;
import com.tech.spcours.paf_smart.module.auth.service.QrAuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final QrAuthService qrAuthService;
    private final com.tech.spcours.paf_smart.module.auth.service.MfaService mfaService;
    private final com.tech.spcours.paf_smart.module.user.repository.UserRepository userRepository;
    private final com.tech.spcours.paf_smart.security.JwtTokenProvider jwtTokenProvider;

    // POST /api/auth/register
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    // POST /api/auth/login
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    // GET /api/auth/qr/generate (must be logged in)
    @GetMapping("/qr/generate")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, String>> generateQr() throws Exception {
        String base64Qr = qrAuthService.generateQrCodeForCurrentUser();
        return ResponseEntity.ok(Map.of("qrImage", base64Qr));
    }

    // POST /api/auth/qr/validate (public — the scanning device calls this)
    @PostMapping("/qr/validate")
    public ResponseEntity<AuthResponse> validateQr(@RequestBody QrValidateRequest request) {
        return ResponseEntity.ok(qrAuthService.validateQrToken(request.getQrToken()));
    }

    // GET /api/auth/me (get current logged-in user info)
    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> getCurrentUser(
            org.springframework.security.core.Authentication auth) {
        var user = (com.tech.spcours.paf_smart.module.user.model.User) auth.getPrincipal();
        return ResponseEntity.ok(Map.of(
                "id", user.getId(),
                "name", user.getName(),
                "email", user.getEmail(),
                "role", user.getRole().name(),
                "isMfaEnabled", user.isMfaEnabled()));
    }

    // --- MFA Endpoints ---

    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("Auth Controller is working!");
    }

    // Public setup for pre-auth (MFA required)
    @GetMapping("/mfa/setup/{userId}")
    public ResponseEntity<?> generateMfaSetupById(@PathVariable String userId) {
        try {
            MfaSetupResponse response = mfaService.generateMfaSetupById(userId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    // Public verify for pre-auth
    @PostMapping("/mfa/verify-setup")
    public ResponseEntity<?> verifyMfaSetupById(@RequestBody MfaLoginVerificationRequest request) {
        try {
            var user = userRepository.findById(request.getUserId())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            if (!mfaService.verifyCode(user.getMfaSecret(), request.getCode())) {
                return ResponseEntity.status(401).body("Invalid MFA code");
            }

            user.setMfaEnabled(true);
            userRepository.save(user);

            String token = jwtTokenProvider.generateToken(user);
            return ResponseEntity.ok(AuthResponse.builder()
                    .token(token)
                    .userId(user.getId())
                    .name(user.getName())
                    .email(user.getEmail())
                    .role(user.getRole().name())
                    .build());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/mfa/setup")
    public ResponseEntity<?> generateMfaSetup() {
        try {
            var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated()) {
                return ResponseEntity.status(401).body("Not authenticated");
            }

            String email = auth.getName();
            System.out.println("Processing MFA for: " + email);

            MfaSetupResponse response = mfaService.generateMfaSetup(email);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    @PostMapping("/mfa/verify")
    public ResponseEntity<?> verifyMfaSetup(@RequestBody MfaVerifyRequest request) {
        try {
            var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getName())) {
                return ResponseEntity.status(401).body("Not authenticated");
            }

            var user = (com.tech.spcours.paf_smart.module.user.model.User) auth.getPrincipal();

            // Check if the code is valid for their new unverified secret
            if (!mfaService.verifyCode(user.getMfaSecret(), request.getCode())) {
                return ResponseEntity.status(401).body("Invalid MFA code");
            }

            // It is valid! Enable MFA and generate a final token
            user.setMfaEnabled(true);
            userRepository.save(user);

            String token = jwtTokenProvider.generateToken(user);
            return ResponseEntity.ok(AuthResponse.builder()
                    .token(token)
                    .userId(user.getId())
                    .name(user.getName())
                    .email(user.getEmail())
                    .role(user.getRole().name())
                    .build());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    @PostMapping("/login/verify-mfa")
    public ResponseEntity<AuthResponse> verifyMfaLogin(@RequestBody MfaLoginVerificationRequest request) {
        var user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.isMfaEnabled()) {
            throw new RuntimeException("MFA not enabled for user");
        }

        if (!mfaService.verifyCode(user.getMfaSecret(), request.getCode())) {
            return ResponseEntity.status(401).body(null);
        }

        String token = jwtTokenProvider.generateToken(user);
        return ResponseEntity.ok(AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build());
    }

    @PostMapping("/mfa/disable")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, String>> disableMfa(
            org.springframework.security.core.Authentication auth,
            @RequestBody MfaVerifyRequest request) {
        var user = (com.tech.spcours.paf_smart.module.user.model.User) auth.getPrincipal();

        if (!mfaService.verifyCode(user.getMfaSecret(), request.getCode())) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid code"));
        }

        user.setMfaEnabled(false);
        user.setMfaSecret(null);
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "MFA disabled successfully"));
    }
}
