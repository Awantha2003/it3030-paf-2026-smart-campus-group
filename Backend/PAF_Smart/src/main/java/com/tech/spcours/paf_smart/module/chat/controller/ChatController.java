package com.tech.spcours.paf_smart.module.chat.controller;

import com.tech.spcours.paf_smart.module.chat.dto.MessageRequest;
import com.tech.spcours.paf_smart.module.chat.model.ChatMessage;
import com.tech.spcours.paf_smart.module.chat.service.ChatService;
import com.tech.spcours.paf_smart.module.user.model.Role;
import com.tech.spcours.paf_smart.module.user.model.User;
import com.tech.spcours.paf_smart.module.user.repository.UserRepository;
import com.tech.spcours.paf_smart.repository.TechnicianMemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {
    private final ChatService chatService;
    private final UserRepository userRepository;
    private final TechnicianMemberRepository technicianMemberRepository;

    @GetMapping("/users")
    public ResponseEntity<List<Map<String, Object>>> getChatUsers(@AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails) {
        String reqEmail = userDetails.getUsername();
        Role currentRole = null;
        String reqId = "";

        // Determine current user from users table
        User currentUser = userRepository.findByEmail(reqEmail).orElse(null);
        if (currentUser != null) {
            reqId = currentUser.getId();
            currentRole = currentUser.getRole();
        } else {
            // Check if current user is a technician
            var techOpt = technicianMemberRepository.findByEmailIgnoreCase(reqEmail);
            if (techOpt.isPresent()) {
                reqId = techOpt.get().getId();
                currentRole = Role.TECHNICIAN;
            } else {
                throw new RuntimeException("Current user not found in DB");
            }
        }

        List<Map<String, Object>> result = new ArrayList<>();
        Set<String> seenEmails = new HashSet<>();
        final String finalReqId = reqId; // For lambda
        final Role finalCurrentRole = currentRole;
        final boolean finalIsAdmin = finalCurrentRole == Role.ADMIN;
        final boolean finalIsTechnician = finalCurrentRole == Role.TECHNICIAN;

        // Fetch users from the main user collection.
        // Admins can message everyone, EXCEPT normal users in technician side. Actually, to be safe, only show ADMINS and TECHNICIANS.
        userRepository.findAll().forEach(u -> {
            if (u.getId() != null && !u.getId().equals(finalReqId) && u.getEmail() != null && !seenEmails.contains(u.getEmail().toLowerCase())) {
                String r = u.getRole() != null ? u.getRole().name() : "USER";   
                // Do not show normal users in the technician/admin side chat 
                if (r.equalsIgnoreCase("ADMIN") || r.equalsIgnoreCase("TECHNICIAN")) {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", u.getId());
                    String name = u.getName();
                    if (name == null || name.trim().isEmpty()) name = "User";
                    map.put("name", name);
                    map.put("email", u.getEmail());
                    map.put("role", r);
                    result.add(map);
                    seenEmails.add(u.getEmail().toLowerCase());
                }
            }
        });

        // Fetch technicians.
        technicianMemberRepository.findAll().forEach(t -> {
            if (t.getId() != null && !t.getId().equals(finalReqId) && t.getEmail() != null && !seenEmails.contains(t.getEmail().toLowerCase())) {
                Map<String, Object> map = new HashMap<>();
                map.put("id", t.getId());
                String name = t.getFullName();
                if (name == null || name.trim().isEmpty()) name = "Technician";
                map.put("name", name);
                map.put("email", t.getEmail());
                map.put("role", "TECHNICIAN");
                result.add(map);
                seenEmails.add(t.getEmail().toLowerCase());
            }
        });

        return ResponseEntity.ok(result);
    }

    @PostMapping("/send")
    public ResponseEntity<ChatMessage> send(@AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails, @RequestBody MessageRequest req) {
        String reqEmail = userDetails.getUsername();
        String reqId = "";
        java.util.Optional<User> uOpt = userRepository.findByEmail(reqEmail);
        if (uOpt.isPresent()) reqId = uOpt.get().getId();
        else {
            var tOpt = technicianMemberRepository.findByEmailIgnoreCase(reqEmail);
            if (tOpt.isPresent()) reqId = tOpt.get().getId();
            else throw new RuntimeException("Current user not found");
        }
        return ResponseEntity.ok(chatService.sendMessage(reqId, req.getReceiverId(), req.getContent()));
    }

    @GetMapping("/history/{targetId}")
    public ResponseEntity<List<ChatMessage>> getHistory(@AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails, @PathVariable String targetId) {
        String reqEmail = userDetails.getUsername();
        String reqId = "";
        java.util.Optional<User> uOpt = userRepository.findByEmail(reqEmail);
        if (uOpt.isPresent()) reqId = uOpt.get().getId();
        else {
            var tOpt = technicianMemberRepository.findByEmailIgnoreCase(reqEmail);
            if (tOpt.isPresent()) reqId = tOpt.get().getId();
            else throw new RuntimeException("Current user not found");
        }
        return ResponseEntity.ok(chatService.getConversation(reqId, targetId));
    }
}
