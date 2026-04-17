package com.tech.spcours.paf_smart.service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.stereotype.Service;

import com.tech.spcours.paf_smart.dto.CreateFacilityBookingRequest;
import com.tech.spcours.paf_smart.dto.FacilityBookingResponse;
import com.tech.spcours.paf_smart.dto.FacilityLectureHallResponse;
import com.tech.spcours.paf_smart.exception.ResourceConflictException;
import com.tech.spcours.paf_smart.exception.ResourceNotFoundException;
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

    public List<FacilityLectureHallResponse> getAvailableSpaces(LocalDate bookingDate) {
        LocalDate targetDate = bookingDate == null ? LocalDate.now() : bookingDate;
        Set<String> bookedSpaceCodes = new HashSet<>(facilityBookingRepository.findByBookingDate(targetDate).stream()
                .map(FacilityBooking::getLectureHallCode)
                .toList());

        return LECTURE_HALLS.values().stream()
                .filter(space -> !bookedSpaceCodes.contains(space.code()))
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
            throw new ResourceConflictException("Selected facility space is not supported");
        }

        validateBookingDateTime(request.bookingDate(), request.bookingTime());

        boolean hallOccupied = facilityBookingRepository.existsByLectureHallCodeAndBookingDateAndBookingTime(
                hall.code(),
                request.bookingDate(),
                request.bookingTime());
        if (hallOccupied) {
            throw new ResourceConflictException("This facility space is already reserved for the selected slot");
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
                .reminderSentAt(null)
                .createdAt(now)
                .updatedAt(now)
                .build();

        return toBookingResponse(facilityBookingRepository.save(booking));
    }

    public FacilityBookingResponse updateBooking(String bookingId, CreateFacilityBookingRequest request, User user) {
        FacilityBooking existingBooking = findOwnedBooking(bookingId, user);
        LectureHallDefinition hall = LECTURE_HALLS.get(request.lectureHallCode().trim().toUpperCase());
        if (hall == null) {
            throw new ResourceConflictException("Selected facility space is not supported");
        }

        validateBookingDateTime(request.bookingDate(), request.bookingTime());

        boolean hallOccupiedByAnotherBooking =
                facilityBookingRepository.existsByLectureHallCodeAndBookingDateAndBookingTimeAndIdNot(
                        hall.code(),
                        request.bookingDate(),
                        request.bookingTime(),
                        existingBooking.getId());
        if (hallOccupiedByAnotherBooking) {
            throw new ResourceConflictException("This facility space is already reserved for the selected slot");
        }

        boolean studentHasAnotherBookingAtSlot =
                facilityBookingRepository.existsByStudentIdAndBookingDateAndBookingTimeAndIdNot(
                        user.getId(),
                        request.bookingDate(),
                        request.bookingTime(),
                        existingBooking.getId());
        if (studentHasAnotherBookingAtSlot) {
            throw new ResourceConflictException("You already have another facility booking at this time");
        }

        existingBooking.setFaculty(request.faculty().trim());
        existingBooking.setBookingDate(request.bookingDate());
        existingBooking.setBookingTime(request.bookingTime());
        existingBooking.setStudentCount(request.studentCount());
        existingBooking.setLectureHallCode(hall.code());
        existingBooking.setBuilding(hall.building());
        existingBooking.setBlock(hall.block());
        existingBooking.setFloor(hall.floor());
        existingBooking.setLectureHallName(hall.name());
        existingBooking.setReminderSentAt(null);
        existingBooking.setUpdatedAt(Instant.now());

        return toBookingResponse(facilityBookingRepository.save(existingBooking));
    }

    public void deleteBooking(String bookingId, User user) {
        FacilityBooking booking = findOwnedBooking(bookingId, user);
        facilityBookingRepository.delete(booking);
    }

    private FacilityLectureHallResponse toLectureHallResponse(LectureHallDefinition hall) {
        return FacilityLectureHallResponse.builder()
                .code(hall.code())
                .building(hall.building())
                .block(hall.block())
                .floor(hall.floor())
                .name(hall.name())
                .displayName(hall.displayName())
                .spaceType(hall.spaceType())
                .capacity(hall.capacity())
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

    private FacilityBooking findOwnedBooking(String bookingId, User user) {
        return facilityBookingRepository.findByIdAndStudentId(bookingId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Facility booking not found for this student"));
    }

    private void validateBookingDateTime(LocalDate bookingDate, LocalTime bookingTime) {
        if (bookingDate.isBefore(LocalDate.now())) {
            throw new ResourceConflictException("Booking date cannot be in the past");
        }

        if (bookingDate.isEqual(LocalDate.now()) && bookingTime.isBefore(LocalTime.now())) {
            throw new ResourceConflictException("Booking time cannot be in the past");
        }
    }

    private static Map<String, LectureHallDefinition> buildLectureHallCatalog() {
        List<LectureHallDefinition> halls = new ArrayList<>();

        halls.addAll(generateBuildingSpaces("Engineering Building", List.of("A", "B"), List.of(2, 3), "ENG"));
        halls.addAll(generateBuildingSpaces("New Building", List.of("G", "F"), List.of(2, 3, 4), "NEW"));
        halls.addAll(generateBuildingSpaces("Business Building", List.of("C", "D"), List.of(2, 3), "BUS"));

        Map<String, LectureHallDefinition> map = new LinkedHashMap<>();
        for (LectureHallDefinition hall : halls) {
            map.put(hall.code(), hall);
        }
        return map;
    }

    private static List<LectureHallDefinition> generateBuildingSpaces(
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
                result.add(new LectureHallDefinition(
                        code,
                        building,
                        block,
                        floor,
                        hallName,
                        displayName,
                        "LECTURE_HALL",
                        60));
            }

            for (int i = 0; i < 2; i++) {
                int floor = allowedFloors.get(Math.min(i, allowedFloors.size() - 1));
                String labName = "Lab " + (i + 1);
                String code = buildingCode + "-" + block + "-F" + floor + "-LAB" + (i + 1);
                String displayName = building + " | Block " + block + " | Floor " + floor + " | " + labName;
                result.add(new LectureHallDefinition(
                        code,
                        building,
                        block,
                        floor,
                        labName,
                        displayName,
                        "LAB",
                        40));
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
            String displayName,
            String spaceType,
            Integer capacity) {
    }
}
