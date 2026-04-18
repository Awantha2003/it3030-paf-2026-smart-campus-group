package com.tech.spcours.paf_smart.model;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "resource_bookings")
public class ResourceBooking {

    @Id
    private String id;

    private String resourceType;

    private String resourceId;

    private String resourceName;

    private String studentId;

    private String studentName;

    private String studentEmail;

    private LocalDate bookingDate;

    private LocalTime bookingTime;

    private Integer durationHours;

    private Integer quantity;

    private String purpose;

    private String status;

    private Instant createdAt;

    private Instant updatedAt;
}
