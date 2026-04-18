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

    private final FacilityBookingRepository facilityBookingRepository;
    private final com.tech.spcours.paf_smart.repository.FacilityRepository facilityRepository;

    public List<FacilityLectureHallResponse> getLectureHalls() {
        return facilityRepository.findBySpaceTypeIn(List.of("LECTURE_HALL", "LAB")).stream()
                .map(this::mapToLectureHallResponse)
                .toList();
    }

    public List<FacilityLectureHallResponse> getAvailableSpaces(LocalDate bookingDate) {
        LocalDate targetDate = bookingDate == null ? LocalDate.now() : bookingDate;
        Set<String> bookedSpaceCodes = new HashSet<>(facilityBookingRepository.findByBookingDate(targetDate).stream()
                .map(com.tech.spcours.paf_smart.model.FacilityBooking::getLectureHallCode)
                .toList());

        return facilityRepository.findBySpaceTypeIn(List.of("LECTURE_HALL", "LAB")).stream()
                .filter(space -> !bookedSpaceCodes.contains(space.getCode()))
                .map(this::mapToLectureHallResponse)
                .toList();
    }

    public List<FacilityBookingResponse> getStudentBookings(User user) {
        return facilityBookingRepository.findByStudentIdOrderByBookingDateDescBookingTimeDesc(user.getId())
                .stream()
                .map(this::toBookingResponse)
                .toList();
    }

    public FacilityBookingResponse createBooking(CreateFacilityBookingRequest request, User user) {
        com.tech.spcours.paf_smart.model.Facility hall = facilityRepository.findByCode(request.lectureHallCode().trim().toUpperCase())
                .orElseThrow(() -> new ResourceConflictException("Selected facility space not found"));

        validateBookingDateTime(request.bookingDate(), request.bookingTime());

        boolean hallOccupied = facilityBookingRepository.existsByLectureHallCodeAndBookingDateAndBookingTime(
                hall.getCode(),
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
        com.tech.spcours.paf_smart.model.FacilityBooking booking = com.tech.spcours.paf_smart.model.FacilityBooking.builder()
                .studentId(user.getId())
                .studentName(user.getName())
                .studentEmail(user.getEmail())
                .faculty(request.faculty().trim())
                .bookingDate(request.bookingDate())
                .bookingTime(request.bookingTime())
                .studentCount(request.studentCount())
                .lectureHallCode(hall.getCode())
                .building(hall.getBuilding())
                .block(hall.getBlock())
                .floor(hall.getFloor())
                .lectureHallName(hall.getName())
                .status("AVAILABLE")
                .reminderSentAt(null)
                .createdAt(now)
                .updatedAt(now)
                .build();

        return toBookingResponse(facilityBookingRepository.save(booking));
    }

    public FacilityBookingResponse updateBooking(String bookingId, CreateFacilityBookingRequest request, User user) {
        com.tech.spcours.paf_smart.model.FacilityBooking existingBooking = findOwnedBooking(bookingId, user);
        com.tech.spcours.paf_smart.model.Facility hall = facilityRepository.findByCode(request.lectureHallCode().trim().toUpperCase())
                .orElseThrow(() -> new ResourceConflictException("Selected facility space not found"));

        validateBookingDateTime(request.bookingDate(), request.bookingTime());

        boolean hallOccupiedByAnotherBooking =
                facilityBookingRepository.existsByLectureHallCodeAndBookingDateAndBookingTimeAndIdNot(
                        hall.getCode(),
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
        existingBooking.setLectureHallCode(hall.getCode());
        existingBooking.setBuilding(hall.getBuilding());
        existingBooking.setBlock(hall.getBlock());
        existingBooking.setFloor(hall.getFloor());
        existingBooking.setLectureHallName(hall.getName());
        existingBooking.setReminderSentAt(null);
        existingBooking.setUpdatedAt(Instant.now());

        return toBookingResponse(facilityBookingRepository.save(existingBooking));
    }

    public void deleteBooking(String bookingId, User user) {
        com.tech.spcours.paf_smart.model.FacilityBooking booking = findOwnedBooking(bookingId, user);
        facilityBookingRepository.delete(booking);
    }

    private FacilityLectureHallResponse mapToLectureHallResponse(com.tech.spcours.paf_smart.model.Facility hall) {
        return FacilityLectureHallResponse.builder()
                .code(hall.getCode())
                .building(hall.getBuilding())
                .block(hall.getBlock())
                .floor(hall.getFloor())
                .name(hall.getName())
                .displayName(hall.getBuilding() + " | Block " + hall.getBlock() + " | Floor " + hall.getFloor() + " | " + hall.getName())
                .spaceType(hall.getSpaceType())
                .capacity(hall.getCapacity())
                .build();
    }

    private FacilityBookingResponse toBookingResponse(com.tech.spcours.paf_smart.model.FacilityBooking booking) {
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

    private com.tech.spcours.paf_smart.model.FacilityBooking findOwnedBooking(String bookingId, User user) {
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
}
