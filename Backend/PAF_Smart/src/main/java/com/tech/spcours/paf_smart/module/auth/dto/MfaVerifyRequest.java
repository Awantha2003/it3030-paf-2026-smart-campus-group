package com.tech.spcours.paf_smart.module.auth.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class MfaVerifyRequest {
    @NotNull(message = "Code is required")
    private Integer code;
}
