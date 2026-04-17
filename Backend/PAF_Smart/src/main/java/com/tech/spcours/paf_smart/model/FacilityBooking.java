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
@Document(collection = "facility_bookings")
public class FacilityBooking {

    @Id
    private String id;

    private String studentId;

    private String studentName;

    private String studentEmail;

    private String faculty;

    private LocalDate bookingDate;

    private LocalTime bookingTime;

    private Integer studentCount;

    private String lectureHallCode;

    private String building;

    private String block;

    private Integer floor;

    private String lectureHallName;

    private String status;

    private Instant createdAt;

    private Instant updatedAt;
}
