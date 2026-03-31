package com.tech.spcours.paf_smart.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tech.spcours.paf_smart.dto.LoginRequest;
import com.tech.spcours.paf_smart.dto.LoginResponse;
import com.tech.spcours.paf_smart.service.AuthService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/technician/login")
    public LoginResponse loginTechnician(@Valid @RequestBody LoginRequest request) {
        return authService.loginTechnician(request);
    }
}
