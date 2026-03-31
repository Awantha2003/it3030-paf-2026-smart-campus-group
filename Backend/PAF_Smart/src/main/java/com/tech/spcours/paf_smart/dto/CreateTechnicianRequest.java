package com.tech.spcours.paf_smart.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateTechnicianRequest {

    @NotBlank(message = "Full name is required")
    @Size(max = 120, message = "Full name must be 120 characters or less")
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    @Size(max = 160, message = "Email must be 160 characters or less")
    private String email;

    @NotBlank(message = "Phone number is required")
    @Pattern(
            regexp = "^[0-9+()\\-\\s]{7,20}$",
            message = "Phone number must contain 7 to 20 valid characters")
    private String phone;

    @NotBlank(message = "Department is required")
    @Size(max = 80, message = "Department must be 80 characters or less")
    private String department;

    @NotBlank(message = "Specialization is required")
    @Size(max = 120, message = "Specialization must be 120 characters or less")
    private String specialization;
}
