package com.tech.spcours.paf_smart.module.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class MfaLoginVerificationRequest {
    @NotBlank(message = "User ID is required")
    private String userId;

    @NotNull(message = "Code is required")
    private Integer code;
}
