package com.tech.spcours.paf_smart.dto;

import java.time.LocalTime;
import java.util.List;
import lombok.Builder;

@Builder
public record FacilityLectureHallResponse(
        String code,
        String building,
        String block,
        Integer floor,
        String name,
        String displayName,
        String spaceType,
        Integer capacity,
        List<BookedSlot> bookedSlots) {
    
    public record BookedSlot(LocalTime startTime, LocalTime endTime) {}
}
