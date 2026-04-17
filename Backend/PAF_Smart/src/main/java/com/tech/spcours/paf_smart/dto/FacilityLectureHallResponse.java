package com.tech.spcours.paf_smart.dto;

import lombok.Builder;

@Builder
public record FacilityLectureHallResponse(
        String code,
        String building,
        String block,
        Integer floor,
        String name,
        String displayName) {
}
