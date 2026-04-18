package com.tech.spcours.paf_smart.module.user.controller;

import com.tech.spcours.paf_smart.module.user.model.Role;
import com.tech.spcours.paf_smart.module.user.model.User;
import com.tech.spcours.paf_smart.module.user.repository.UserRepository;
import com.tech.spcours.paf_smart.repository.TechnicianMemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class UserController {

    private final UserRepository userRepository;
    private final TechnicianMemberRepository technicianMemberRepository;

    // GET /api/admin/users
    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    // POST /api/admin/users
    @PostMapping
    public ResponseEntity<User> createUser(@RequestBody User user) {
        // Provide defaults if missing
        if (user.getProvider() == null) {
            user.setProvider("local");
        }
        if (user.getRole() == null) {
            user.setRole(Role.USER);
        }
        return ResponseEntity.ok(userRepository.save(user));
    }

    // PATCH /api/admin/users/{id}/role
    @PatchMapping("/{id}/role")
    public ResponseEntity<Map<String, String>> updateRole(
            @PathVariable String id,
            @RequestBody Map<String, String> body) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Role newRole = Role.valueOf(body.get("role").toUpperCase());
        user.setRole(newRole);
        userRepository.save(user);

        return ResponseEntity.ok(Map.of(
                "message", "Role updated to " + newRole,
                "email", user.getEmail()
        ));
    }

    // DELETE /api/admin/users/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteUser(@PathVariable String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        technicianMemberRepository.findByEmailIgnoreCase(user.getEmail())
                .ifPresent(technicianMemberRepository::delete);
        userRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "User deleted"));
    }

    // PATCH /api/admin/users/{id}/status
    @PatchMapping("/{id}/status")
    public ResponseEntity<Map<String, Object>> updateStatus(
            @PathVariable String id,
            @RequestBody Map<String, Boolean> body) {
        
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));     

        Boolean isEnabled = body.get("enabled");
        if (isEnabled != null) {
            user.setEnabled(isEnabled);
            userRepository.save(user);
            technicianMemberRepository.findByEmailIgnoreCase(user.getEmail()).ifPresent(technician -> {
                technician.setActive(isEnabled);
                technicianMemberRepository.save(technician);
            });
        }

        return ResponseEntity.ok(Map.of(
                "message", "User status updated",
                "enabled", user.isEnabled()
        ));
    }
}
