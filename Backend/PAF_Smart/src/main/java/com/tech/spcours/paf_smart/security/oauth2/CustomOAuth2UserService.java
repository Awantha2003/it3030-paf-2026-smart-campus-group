package com.tech.spcours.paf_smart.security.oauth2;

import com.tech.spcours.paf_smart.module.user.model.Role;
import com.tech.spcours.paf_smart.module.user.model.User;
import com.tech.spcours.paf_smart.module.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        try {
            System.out.println("Processing OAuth2 Login for registration ID: " + userRequest.getClientRegistration().getRegistrationId());
            
            OAuth2User oAuth2User = super.loadUser(userRequest);

            String email      = oAuth2User.getAttribute("email");
            String name       = oAuth2User.getAttribute("name");
            String providerId = oAuth2User.getAttribute("sub"); // Google's unique user ID

            System.out.println("OAuth2 User loaded: email=" + email + ", name=" + name);

            if (email == null) {
                System.err.println("ERROR: Email attribute missing from OAuth2 provider response!");
                throw new OAuth2AuthenticationException("Email not found from OAuth2 provider");
            }

            // Find existing user or create a new one
            User user = userRepository.findByEmail(email).orElseGet(() -> {
                System.out.println("Creating new OAuth2 user in database: " + email);
                User newUser = User.builder()
                        .name(name)
                        .email(email)
                        .role(Role.USER)          // Default role
                        .provider("google")
                        .providerId(providerId)
                        .enabled(true)
                        .build();
                return userRepository.save(newUser);
            });

            return oAuth2User;
        } catch (Exception e) {
            System.err.println("CRITICAL ERROR during OAuth2 login: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
}