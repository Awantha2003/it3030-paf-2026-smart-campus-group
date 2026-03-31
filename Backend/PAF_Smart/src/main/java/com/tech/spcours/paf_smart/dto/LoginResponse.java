package com.tech.spcours.paf_smart.dto;

import lombok.Builder;

@Builder
public record LoginResponse(
        String message,
        AuthUserResponse user) {
}
