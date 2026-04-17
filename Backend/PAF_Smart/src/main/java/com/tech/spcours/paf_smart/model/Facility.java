package com.tech.spcours.paf_smart.model;

import java.time.Instant;
import java.util.List;

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
@Document(collection = "facilities")
public class Facility {

    @Id
    private String id;

    @Indexed(unique = true)
    private String code;

    private String name;

    private String building;

    private String block;

    private Integer floor;

    private String spaceType; // e.g., LECTURE_HALL, LAB, MEETING_ROOM

    private Integer capacity;

    private String description;

    private List<String> amenities; // e.g., ["Projector", "AC", "Whiteboard"]

    private String imageUrl;

    @Builder.Default
    private String status = "OPERATIONAL"; // e.g., OPERATIONAL, MAINTENANCE, CLOSED

    private Instant createdAt;

    private Instant updatedAt;
}
