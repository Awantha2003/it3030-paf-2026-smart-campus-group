package com.tech.spcours.paf_smart.service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.tech.spcours.paf_smart.dto.CreateFacilityBookingRequest;
import com.tech.spcours.paf_smart.dto.FacilityBookingResponse;
import com.tech.spcours.paf_smart.dto.FacilityLectureHallResponse;
import com.tech.spcours.paf_smart.exception.ResourceConflictException;
import com.tech.spcours.paf_smart.model.FacilityBooking;
import com.tech.spcours.paf_smart.module.user.model.User;
import com.tech.spcours.paf_smart.repository.FacilityBookingRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class FacilityBookingService {

    private static final Map<String, LectureHallDefinition> LECTURE_HALLS = buildLectureHallCatalog();

    private final FacilityBookingRepository facilityBookingRepository;

    public List<FacilityLectureHallResponse> getLectureHalls() {
        return LECTURE_HALLS.values().stream()
                .map(this::toLectureHallResponse)
                .toList();
    }

    public List<FacilityBookingResponse> getStudentBookings(User user) {
        return facilityBookingRepository.findByStudentIdOrderByBookingDateDescBookingTimeDesc(user.getId())
                .stream()
                .map(this::toBookingResponse)
                .toList();
    }

    public FacilityBookingResponse createBooking(CreateFacilityBookingRequest request, User user) {
        LectureHallDefinition hall = LECTURE_HALLS.get(request.lectureHallCode().trim().toUpperCase());
        if (hall == null) {
            throw new ResourceConflictException("Selected lecture hall is not supported");
        }

        if (request.bookingDate().isBefore(LocalDate.now())) {
            throw new ResourceConflictException("Booking date cannot be in the past");
        }

        if (request.bookingDate().isEqual(LocalDate.now()) && request.bookingTime().isBefore(LocalTime.now())) {
            throw new ResourceConflictException("Booking time cannot be in the past");
        }

        boolean hallOccupied = facilityBookingRepository.existsByLectureHallCodeAndBookingDateAndBookingTime(
                hall.code(),
                request.bookingDate(),
                request.bookingTime());
        if (hallOccupied) {
            throw new ResourceConflictException("This lecture hall is already reserved for the selected slot");
        }

        boolean studentHasBookingAtSameSlot = facilityBookingRepository.existsByStudentIdAndBookingDateAndBookingTime(
                user.getId(),
                request.bookingDate(),
                request.bookingTime());
        if (studentHasBookingAtSameSlot) {
            throw new ResourceConflictException("You already have another facility booking at this time");
        }

        Instant now = Instant.now();
        FacilityBooking booking = FacilityBooking.builder()
                .studentId(user.getId())
                .studentName(user.getName())
                .studentEmail(user.getEmail())
                .faculty(request.faculty().trim())
                .bookingDate(request.bookingDate())
                .bookingTime(request.bookingTime())
                .studentCount(request.studentCount())
                .lectureHallCode(hall.code())
                .building(hall.building())
                .block(hall.block())
                .floor(hall.floor())
                .lectureHallName(hall.name())
                .status("AVAILABLE")
                .createdAt(now)
                .updatedAt(now)
                .build();

        return toBookingResponse(facilityBookingRepository.save(booking));
    }

    private FacilityLectureHallResponse toLectureHallResponse(LectureHallDefinition hall) {
        return FacilityLectureHallResponse.builder()
                .code(hall.code())
                .building(hall.building())
                .block(hall.block())
                .floor(hall.floor())
                .name(hall.name())
                .displayName(hall.displayName())
                .build();
    }

    private FacilityBookingResponse toBookingResponse(FacilityBooking booking) {
        return FacilityBookingResponse.builder()
                .id(booking.getId())
                .studentId(booking.getStudentId())
                .studentName(booking.getStudentName())
                .studentEmail(booking.getStudentEmail())
                .faculty(booking.getFaculty())
                .bookingDate(booking.getBookingDate())
                .bookingTime(booking.getBookingTime())
                .studentCount(booking.getStudentCount())
                .lectureHallCode(booking.getLectureHallCode())
                .building(booking.getBuilding())
                .block(booking.getBlock())
                .floor(booking.getFloor())
                .lectureHallName(booking.getLectureHallName())
                .status(booking.getStatus())
                .createdAt(booking.getCreatedAt())
                .updatedAt(booking.getUpdatedAt())
                .build();
    }

    private static Map<String, LectureHallDefinition> buildLectureHallCatalog() {
        List<LectureHallDefinition> halls = new ArrayList<>();

        halls.addAll(generateBuildingHalls("Engineering Building", List.of("A", "B"), List.of(2, 3), "ENG"));
        halls.addAll(generateBuildingHalls("New Building", List.of("G", "F"), List.of(2, 3, 4), "NEW"));
        halls.addAll(generateBuildingHalls("Business Building", List.of("C", "D"), List.of(2, 3), "BUS"));

        Map<String, LectureHallDefinition> map = new LinkedHashMap<>();
        for (LectureHallDefinition hall : halls) {
            map.put(hall.code(), hall);
        }
        return map;
    }

    private static List<LectureHallDefinition> generateBuildingHalls(
            String building,
            List<String> blocks,
            List<Integer> allowedFloors,
            String buildingCode) {
        List<LectureHallDefinition> result = new ArrayList<>();
        int[] floorPattern = allowedFloors.size() == 3 ? new int[]{2, 3, 4, 4} : new int[]{2, 2, 3, 3};

        for (String block : blocks) {
            for (int i = 0; i < 4; i++) {
                int floor = floorPattern[i];
                String hallName = "Lecture Hall " + (i + 1);
                String code = buildingCode + "-" + block + "-F" + floor + "-LH" + (i + 1);
                String displayName = building + " | Block " + block + " | Floor " + floor + " | " + hallName;
                result.add(new LectureHallDefinition(code, building, block, floor, hallName, displayName));
            }
        }

        return result;
    }

    private record LectureHallDefinition(
            String code,
            String building,
            String block,
            Integer floor,
            String name,
            String displayName) {
    }
}
