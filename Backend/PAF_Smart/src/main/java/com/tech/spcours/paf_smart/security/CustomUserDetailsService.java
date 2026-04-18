package com.tech.spcours.paf_smart.security;

import com.tech.spcours.paf_smart.module.user.repository.UserRepository;
import com.tech.spcours.paf_smart.repository.TechnicianMemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;
    private final TechnicianMemberRepository technicianMemberRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return userRepository.findByEmail(email)
                .map(user -> (UserDetails) user)
                .orElseGet(() -> technicianMemberRepository.findByEmailIgnoreCase(email)
                        .map(technician -> new org.springframework.security.core.userdetails.User(
                                technician.getEmail(),
                                technician.getPasswordHash() != null ? technician.getPasswordHash() : "",
                                technician.isActive(),
                                true,
                                true,
                                true,
                                List.of(new SimpleGrantedAuthority("ROLE_TECHNICIAN"))))
                        .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email)));
    }
}