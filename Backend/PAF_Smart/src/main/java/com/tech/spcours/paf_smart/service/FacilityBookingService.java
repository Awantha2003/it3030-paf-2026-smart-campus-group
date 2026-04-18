package com.tech.spcours.paf_smart.service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.HashSet;
import java.util.List;
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
import com.tech.spcours.paf_smart.module.notification.service.NotificationService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class FacilityBookingService {

    private static final Set<String> FACILITY_CATEGORY_TYPES = Set.of(
            "FACILITY",
            "LECTURE_HALL",
            "LAB",
            "MEETING_ROOM",
            "AUDITORIUM");

    private static final Set<String> SPORTS_CATEGORY_TYPES = Set.of(
            "SPORTS",
            "SPORTS_VENUE");

    private static final Set<String> LIBRARY_CATEGORY_TYPES = Set.of(
            "LIBRARY",
            "LIBRARY_ZONE");

    private static final Set<String> EVENT_CATEGORY_TYPES = Set.of(
            "EVENT",
            "SEMINAR_ROOM");

    private final FacilityBookingRepository facilityBookingRepository;
    private final com.tech.spcours.paf_smart.repository.FacilityRepository facilityRepository;
    private final NotificationService notificationService;

    public List<FacilityLectureHallResponse> getLectureHalls() {
        return facilityRepository.findAll().stream()
                .filter(space -> "FACILITY".equals(resolveResourceCategory(space.getSpaceType())))
                .map(this::mapToLectureHallResponse)
                .toList();
    }

    public List<FacilityLectureHallResponse> getAvailableSpaces(
            LocalDate bookingDate,
            LocalTime bookingTime,
            Integer durationHours) {
        LocalDate targetDate = bookingDate == null ? LocalDate.now() : bookingDate;
        int requestedDurationHours = sanitizeDuration(durationHours);

        if (bookingTime == null) {
            Set<String> bookedSpaceCodes = new HashSet<>(facilityBookingRepository.findByBookingDate(targetDate).stream()
                    .map(com.tech.spcours.paf_smart.model.FacilityBooking::getLectureHallCode)
                    .toList());

            return facilityRepository.findAll().stream()
                    .filter(space -> "FACILITY".equals(resolveResourceCategory(space.getSpaceType())))
                    .filter(space -> !bookedSpaceCodes.contains(space.getCode()))
                    .map(this::mapToLectureHallResponse)
                    .toList();
        }

        return facilityRepository.findAll().stream()
                .filter(space -> "FACILITY".equals(resolveResourceCategory(space.getSpaceType())))
                .filter(space -> {
                    List<FacilityBooking> sameHallBookings = facilityBookingRepository.findByLectureHallCodeAndBookingDate(
                            space.getCode(),
                            targetDate);
                    return sameHallBookings.stream().noneMatch(existingBooking ->
                            isOverlappingSlot(
                                    existingBooking.getBookingTime(),
                                    sanitizeDuration(existingBooking.getDurationHours()),
                                    bookingTime,
                                    requestedDurationHours));
                })
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
        if (!"FACILITY".equals(resolveResourceCategory(hall.getSpaceType()))) {
            throw new ResourceConflictException("Only facility category spaces can be booked here");
        }

        int requestedDurationHours = sanitizeDuration(request.durationHours());
        validateBookingDateTime(request.bookingDate(), request.bookingTime(), requestedDurationHours);
        ensureHallIsAvailableForSlot(hall.getCode(), request.bookingDate(), request.bookingTime(), requestedDurationHours, null);
        ensureStudentHasNoOverlap(user.getId(), request.bookingDate(), request.bookingTime(), requestedDurationHours, null);

        Instant now = Instant.now();
        com.tech.spcours.paf_smart.model.FacilityBooking booking = com.tech.spcours.paf_smart.model.FacilityBooking.builder()
                .studentId(user.getId())
                .studentName(user.getName())
                .studentEmail(user.getEmail())
                .faculty(request.faculty().trim())
                .bookingDate(request.bookingDate())
                .bookingTime(request.bookingTime())
                .durationHours(requestedDurationHours)
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

        com.tech.spcours.paf_smart.model.FacilityBooking saved = facilityBookingRepository.save(booking);

        notificationService.send(user.getId(), "Booking Confirmed", "Your booking for " + hall.getName() + " on " + request.bookingDate().toString() + " at " + request.bookingTime().toString() + " is confirmed.", "BOOKINGS", saved.getId());

        return toBookingResponse(saved);
    }

    public FacilityBookingResponse updateBooking(String bookingId, CreateFacilityBookingRequest request, User user) {
        com.tech.spcours.paf_smart.model.FacilityBooking existingBooking = findOwnedBooking(bookingId, user);
        com.tech.spcours.paf_smart.model.Facility hall = facilityRepository.findByCode(request.lectureHallCode().trim().toUpperCase())
                .orElseThrow(() -> new ResourceConflictException("Selected facility space not found"));
        if (!"FACILITY".equals(resolveResourceCategory(hall.getSpaceType()))) {
            throw new ResourceConflictException("Only facility category spaces can be booked here");
        }

        int requestedDurationHours = sanitizeDuration(request.durationHours());
        validateBookingDateTime(request.bookingDate(), request.bookingTime(), requestedDurationHours);
        ensureHallIsAvailableForSlot(
                hall.getCode(),
                request.bookingDate(),
                request.bookingTime(),
                requestedDurationHours,
                existingBooking.getId());
        ensureStudentHasNoOverlap(
                user.getId(),
                request.bookingDate(),
                request.bookingTime(),
                requestedDurationHours,
                existingBooking.getId());

        existingBooking.setFaculty(request.faculty().trim());
        existingBooking.setBookingDate(request.bookingDate());
        existingBooking.setBookingTime(request.bookingTime());
        existingBooking.setDurationHours(requestedDurationHours);
        existingBooking.setStudentCount(request.studentCount());
        existingBooking.setLectureHallCode(hall.getCode());
        existingBooking.setBuilding(hall.getBuilding());
        existingBooking.setBlock(hall.getBlock());
        existingBooking.setFloor(hall.getFloor());
        existingBooking.setLectureHallName(hall.getName());
        existingBooking.setReminderSentAt(null);
        existingBooking.setUpdatedAt(Instant.now());

        com.tech.spcours.paf_smart.model.FacilityBooking saved = facilityBookingRepository.save(existingBooking);

        notificationService.send(user.getId(), "Booking Updated", "Your booking for " + hall.getName() + " on " + request.bookingDate().toString() + " at " + request.bookingTime().toString() + " has been successfully updated.", "BOOKINGS", saved.getId());

        return toBookingResponse(saved);
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
                .durationHours(booking.getDurationHours())
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

    private void validateBookingDateTime(LocalDate bookingDate, LocalTime bookingTime, int durationHours) {
        if (bookingDate.isBefore(LocalDate.now())) {
            throw new ResourceConflictException("Booking date cannot be in the past");
        }

        if (bookingDate.isEqual(LocalDate.now()) && bookingTime.isBefore(LocalTime.now())) {
            throw new ResourceConflictException("Booking time cannot be in the past");
        }

        if (durationHours < 1 || durationHours > 12) {
            throw new ResourceConflictException("Booking duration must be between 1 and 12 hours");
        }
    }

    private void ensureHallIsAvailableForSlot(
            String hallCode,
            LocalDate bookingDate,
            LocalTime bookingTime,
            int durationHours,
            String excludedBookingId) {
        List<FacilityBooking> sameHallBookings =
                facilityBookingRepository.findByLectureHallCodeAndBookingDate(hallCode, bookingDate);

        boolean hasOverlap = sameHallBookings.stream()
                .filter(existing -> excludedBookingId == null || !excludedBookingId.equals(existing.getId()))
                .anyMatch(existing ->
                        isOverlappingSlot(
                                existing.getBookingTime(),
                                sanitizeDuration(existing.getDurationHours()),
                                bookingTime,
                                durationHours));

        if (hasOverlap) {
            throw new ResourceConflictException("This facility space is already reserved for the selected slot");
        }
    }

    private void ensureStudentHasNoOverlap(
            String studentId,
            LocalDate bookingDate,
            LocalTime bookingTime,
            int durationHours,
            String excludedBookingId) {
        List<FacilityBooking> studentDayBookings =
                facilityBookingRepository.findByStudentIdAndBookingDate(studentId, bookingDate);

        boolean hasOverlap = studentDayBookings.stream()
                .filter(existing -> excludedBookingId == null || !excludedBookingId.equals(existing.getId()))
                .anyMatch(existing ->
                        isOverlappingSlot(
                                existing.getBookingTime(),
                                sanitizeDuration(existing.getDurationHours()),
                                bookingTime,
                                durationHours));

        if (hasOverlap) {
            throw new ResourceConflictException("You already have another facility booking at this time");
        }
    }

    private boolean isOverlappingSlot(
            LocalTime existingStart,
            int existingDurationHours,
            LocalTime requestedStart,
            int requestedDurationHours) {
        int existingStartMinutes = toMinutes(existingStart);
        int existingEndMinutes = existingStartMinutes + (existingDurationHours * 60);
        int requestedStartMinutes = toMinutes(requestedStart);
        int requestedEndMinutes = requestedStartMinutes + (requestedDurationHours * 60);
        return requestedStartMinutes < existingEndMinutes && existingStartMinutes < requestedEndMinutes;
    }

    private int toMinutes(LocalTime value) {
        return (value.getHour() * 60) + value.getMinute();
    }

    private int sanitizeDuration(Integer durationHours) {
        if (durationHours == null || durationHours < 1) {
            return 1;
        }
        if (durationHours > 12) {
            return 12;
        }
        return durationHours;
    }

    private String resolveResourceCategory(String rawSpaceType) {
        if (rawSpaceType == null || rawSpaceType.isBlank()) {
            return "FACILITY";
        }

        String normalized = rawSpaceType.trim().toUpperCase();

        if (SPORTS_CATEGORY_TYPES.contains(normalized)) {
            return "SPORTS";
        }
        if (LIBRARY_CATEGORY_TYPES.contains(normalized)) {
            return "LIBRARY";
        }
        if (EVENT_CATEGORY_TYPES.contains(normalized)) {
            return "EVENT";
        }
        if (FACILITY_CATEGORY_TYPES.contains(normalized)) {
            return "FACILITY";
        }

        return "FACILITY";
    }
}
