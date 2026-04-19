package com.tech.spcours.paf_smart.dto;

import jakarta.validation.constraints.NotNull;

public record UpdateTechnicianStatusRequest(
        @NotNull(message = "Active status is required")
        Boolean active) {
}
