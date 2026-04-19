package com.tech.spcours.paf_smart.security.oauth2;

import com.tech.spcours.paf_smart.security.JwtTokenProvider;
import com.tech.spcours.paf_smart.module.user.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import com.tech.spcours.paf_smart.module.notification.service.NotificationService;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");

        // Load full UserDetails to generate JWT
        var user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found after OAuth2"));

        // If MFA is enabled, we don't send the token yet.
        // We send a redirect that tells the frontend to show the verify screen.
        if (user.isMfaEnabled()) {
            String redirectUrl = frontendUrl + "/oauth2/callback?mfaRequired=true&userId=" + user.getId();
            getRedirectStrategy().sendRedirect(request, response, redirectUrl);
            return;
        }

        String token = jwtTokenProvider.generateToken(user);

        notificationService.send(
            user.getId(),
            "Login Success",
            "A successful login was recorded for your account via Google.",
            "SYSTEM",
            user.getId()
        );

        // Redirect to frontend with token and role as query params
        String redirectUrl = frontendUrl + "/oauth2/callback?token=" + token + "&role=" + user.getRole().name();
        getRedirectStrategy().sendRedirect(request, response, redirectUrl);

    }
}