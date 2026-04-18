package com.tech.spcours.paf_smart.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Locale;
import java.util.Map;

@RestController
@RequestMapping("/api/resources")
public class ResourceCatalogController {

    private static final List<ResourceTypeResponse> RESOURCE_TYPES = List.of(
            new ResourceTypeResponse(
                    "FACILITY",
                    "Facility",
                    "Lecture halls, labs, studios, and meeting spaces",
                    "42 spaces",
                    List.of("Live availability checks", "Smart slot conflict detection", "Instant confirmation + reminders")),
            new ResourceTypeResponse(
                    "EQUIPMENT",
                    "Equipment",
                    "Projectors, cameras, kits, and multimedia gear",
                    "127 items",
                    List.of("Damage-precheck workflow", "Pickup + return slot planning", "Usage logs per booking")),
            new ResourceTypeResponse(
                    "SPORTS",
                    "Sports",
                    "Courts, fields, gym slots, and training zones",
                    "18 venues",
                    List.of("Team-based reservations", "Practice schedule visibility", "Peak-hour balancing")),
            new ResourceTypeResponse(
                    "LIBRARY",
                    "Library",
                    "Reading rooms, research pods, and media booths",
                    "9 zones",
                    List.of("Quiet-zone compliance", "Seat cap intelligence", "Auto-release for no-shows")),
            new ResourceTypeResponse(
                    "EVENT",
                    "Event",
                    "Seminars, exhibitions, clubs, and special events",
                    "11 upcoming",
                    List.of("Stage + setup allocation", "Cross-team approval routing", "Reminder timeline automation")));

    private static final Map<String, List<ResourceItemResponse>> RESOURCE_CATALOG = Map.of(
            "FACILITY", List.of(
                    new ResourceItemResponse(
                            "facility-lh-01",
                            "FACILITY",
                            "Lecture Hall 1",
                            "Engineering Building - Block A",
                            "Floor 2",
                            60,
                            1,
                            1,
                            false,
                            "Up to 30 days",
                            List.of("Projector", "Whiteboard"),
                            List.of("Live availability checks", "Instant confirmation"))),
            "EQUIPMENT", List.of(
                    new ResourceItemResponse(
                            "equipment-media-kit-01",
                            "EQUIPMENT",
                            "Media Kit",
                            "Camera and microphone bundle",
                            "Resource Counter",
                            1,
                            10,
                            6,
                            true,
                            "Up to 14 days",
                            List.of("Inventory tracked"),
                            List.of("Pickup and return slots"))),
            "SPORTS", List.of(),
            "LIBRARY", List.of(),
            "EVENT", List.of());

    @GetMapping("/types")
    public List<ResourceTypeResponse> getResourceTypes() {
        return RESOURCE_TYPES;
    }

    @GetMapping
    public List<ResourceItemResponse> getResources(@RequestParam(required = false) String type) {
        if (type == null || type.isBlank()) {
            return RESOURCE_CATALOG.values().stream()
                    .flatMap(List::stream)
                    .toList();
        }

        return RESOURCE_CATALOG.getOrDefault(type.trim().toUpperCase(Locale.ROOT), List.of());
    }

    public record ResourceTypeResponse(
            String type,
            String title,
            String summary,
            String availabilityLabel,
            List<String> featurePills
    ) {
    }

    public record ResourceItemResponse(
            String id,
            String type,
            String name,
            String subtitle,
            String location,
            int capacity,
            int totalUnits,
            int availableUnits,
            boolean approvalRequired,
            String bookingWindow,
            List<String> tags,
            List<String> highlights
    ) {
    }
}
