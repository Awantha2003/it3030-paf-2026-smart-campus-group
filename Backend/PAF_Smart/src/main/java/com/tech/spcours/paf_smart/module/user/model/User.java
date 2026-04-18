package com.tech.spcours.paf_smart.module.user.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@Document(collection = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User implements UserDetails {

    @Id
    private String id;

    private String name;

    private String email;

    // Nullable — Google users won't have a password
    private String password;

    private Role role;

    // "local" or "google"
    private String provider;

    // Google's subject ID (only for Google users)
    private String providerId;

    // For QR login — stores a temporary token
    private String qrToken;

    @Builder.Default
    private boolean enabled = true;

    // TOTP MFA Secret
    private String mfaSecret;

    // Is MFA setup complete
    @Builder.Default
    private boolean isMfaEnabled = false;

    // ─── UserDetails overrides ───────────────────────────

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        if (role == null) {
            return List.of(new SimpleGrantedAuthority("ROLE_USER"));
        }
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));      
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public boolean isAccountNonExpired()    { return true; }
    @Override
    public boolean isAccountNonLocked()     { return true; }
    @Override
    public boolean isCredentialsNonExpired(){ return true; }
    @Override
    public boolean isEnabled()              { return enabled; }
}
