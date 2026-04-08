package com.tech.spcours.paf_smart.model;

import java.time.Instant;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "technicians")
public class TechnicianMember {

    @Id
    private String id;

    private String fullName;

    @Indexed(unique = true)
    private String email;

    private String passwordHash;

    private String phone;

    private String department;

    private String specialization;

    private boolean active;

    private Double currentLatitude;

    private Double currentLongitude;

    private String currentLocation;

    private Instant trackingUpdatedAt;

    private Instant createdAt;

    private Instant updatedAt;
}
