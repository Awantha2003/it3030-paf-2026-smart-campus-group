package com.tech.spcours.paf_smart.dto;

import lombok.Builder;

@Builder
public record AuthUserResponse(
        String id,
        String name,
        String email,
        String role,
        String department,
        String specialization) {
}
