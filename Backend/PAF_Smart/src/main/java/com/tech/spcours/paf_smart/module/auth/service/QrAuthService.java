package com.tech.spcours.paf_smart.module.auth.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.tech.spcours.paf_smart.module.auth.dto.AuthResponse;
import com.tech.spcours.paf_smart.security.JwtTokenProvider;
import com.tech.spcours.paf_smart.module.user.model.User;
import com.tech.spcours.paf_smart.module.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.util.Base64;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class QrAuthService {

    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;

    /**
     * Generates a QR code for the currently logged-in user.
     * The QR encodes a short-lived random token stored in the DB.
     * Returns a base64 PNG the frontend can display as <img src="data:image/png;base64,...">
     */
    public String generateQrCodeForCurrentUser() throws Exception {
        String email = SecurityContextHolder.getContext()
                .getAuthentication().getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Generate a random token and save it
        String qrToken = UUID.randomUUID().toString();
        user.setQrToken(qrToken);
        userRepository.save(user);

        // Encode QR
        QRCodeWriter qrWriter = new QRCodeWriter();
        BitMatrix bitMatrix = qrWriter.encode(qrToken, BarcodeFormat.QR_CODE, 250, 250);
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        MatrixToImageWriter.writeToStream(bitMatrix, "PNG", outputStream);

        return Base64.getEncoder().encodeToString(outputStream.toByteArray());
    }

    /**
     * Validates QR token and returns a JWT — used when another device scans the QR.
     */
    public AuthResponse validateQrToken(String qrToken) {
        User user = userRepository.findByQrToken(qrToken)
                .orElseThrow(() -> new RuntimeException("Invalid or expired QR token"));

        // Invalidate the QR token after use (one-time use)
        user.setQrToken(null);
        userRepository.save(user);

        String jwt = jwtTokenProvider.generateToken(user);
        return AuthResponse.builder()
                .token(jwt)
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }
}