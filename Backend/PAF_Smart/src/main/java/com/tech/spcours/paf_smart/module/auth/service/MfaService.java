package com.tech.spcours.paf_smart.module.auth.service;

import com.tech.spcours.paf_smart.module.auth.dto.MfaSetupResponse;
import com.tech.spcours.paf_smart.module.user.model.User;
import com.tech.spcours.paf_smart.module.user.repository.UserRepository;
import com.warrenstrange.googleauth.GoogleAuthenticator;
import com.warrenstrange.googleauth.GoogleAuthenticatorKey;
import com.warrenstrange.googleauth.GoogleAuthenticatorQRGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MfaService {

    private final UserRepository userRepository;
    private final GoogleAuthenticator gAuth = new GoogleAuthenticator();

    /**
     * Generates a new TOTP secret and QR code URI for the given user email.
     * Used when the user is already authenticated (has JWT token).
     */
    public MfaSetupResponse generateMfaSetup(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found: " + userEmail));

        GoogleAuthenticatorKey key = gAuth.createCredentials();
        String secret = key.getKey();

        user.setMfaSecret(secret);
        userRepository.save(user);

        String otpUri = GoogleAuthenticatorQRGenerator.getOtpAuthTotpURL(
                "SmartCampus", userEmail, key);

        return new MfaSetupResponse(otpUri, secret);
    }

    /**
     * Generates a new TOTP secret and QR code URI for the given user ID.
     * Used in the post-registration flow before a JWT token is issued.
     */
    public MfaSetupResponse generateMfaSetupById(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        GoogleAuthenticatorKey key = gAuth.createCredentials();
        String secret = key.getKey();

        user.setMfaSecret(secret);
        userRepository.save(user);

        String otpUri = GoogleAuthenticatorQRGenerator.getOtpAuthTotpURL(
                "SmartCampus", user.getEmail(), key);

        return new MfaSetupResponse(otpUri, secret);
    }

    /**
     * Verifies a 6-digit TOTP code against the stored secret.
     */
    public boolean verifyCode(String secret, int code) {
        return gAuth.authorize(secret, code);
    }
}
