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
@Document(collection = "equipments")
public class Equipment {

    @Id
    private String id;

    @Indexed
    private String facilityId; // Links to the Facility this equipment belongs to

    private String name;

    private String description;

    private Integer totalQuantity;

    private Integer availableQuantity;

    @Builder.Default
    private String status = "OPERATIONAL"; // OPERATIONAL, UNDER_REPAIR, OUT_OF_STOCK

    private boolean approvalRequired;

    private String imageUrl;

    private Instant createdAt;

    private Instant updatedAt;
}
