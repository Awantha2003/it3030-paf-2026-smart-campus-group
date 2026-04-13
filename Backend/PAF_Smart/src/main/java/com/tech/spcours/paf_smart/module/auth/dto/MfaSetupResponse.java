package com.tech.spcours.paf_smart.module.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MfaSetupResponse {
    private String otpUri;
    private String secret;
}
