package com.tech.spcours.paf_smart.service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Set;

import org.springframework.stereotype.Service;

import com.tech.spcours.paf_smart.dto.CreateResourceBookingRequest;
import com.tech.spcours.paf_smart.dto.ResourceBookingResponse;
import com.tech.spcours.paf_smart.dto.UpdateBookingStatusRequest;
import com.tech.spcours.paf_smart.exception.ResourceConflictException;
import com.tech.spcours.paf_smart.exception.ResourceNotFoundException;
import com.tech.spcours.paf_smart.model.ResourceBooking;
import com.tech.spcours.paf_smart.module.user.model.User;
import com.tech.spcours.paf_smart.module.user.repository.UserRepository;
import com.tech.spcours.paf_smart.repository.EquipmentRepository;
import com.tech.spcours.paf_smart.repository.FacilityRepository;
import com.tech.spcours.paf_smart.repository.ResourceBookingRepository;
import com.tech.spcours.paf_smart.module.notification.service.NotificationService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ResourceBookingService {

    private static final Set<String> SUPPORTED_TYPES = Set.of("EQUIPMENT", "SPORTS", "LIBRARY", "EVENT");
    private static final Set<String> SPORTS_CATEGORY_TYPES = Set.of("SPORTS", "SPORTS_VENUE");
    private static final Set<String> LIBRARY_CATEGORY_TYPES = Set.of("LIBRARY", "LIBRARY_ZONE");
    private static final Set<String> EVENT_CATEGORY_TYPES = Set.of("EVENT", "SEMINAR_ROOM");

    private final ResourceBookingRepository resourceBookingRepository;
    private final EquipmentRepository equipmentRepository;
    private final FacilityRepository facilityRepository;
    private final NotificationService notificationService;
    private final UserRepository userRepository;

    public List<ResourceBookingResponse> getMyBookings(User user, String resourceType) {
        String normalizedType = normalizeResourceType(resourceType);
        return resourceBookingRepository.findByStudentIdAndResourceTypeOrderByBookingDateDescBookingTimeDesc(
                user.getId(),
                normalizedType)
                .stream()
                .filter(this::isBlockingStatus)
                .map(this::toResponse)
                .toList();
    }

    public List<ResourceBookingResponse> getAllBookings() {
        return resourceBookingRepository.findAllByOrderByBookingDateDescBookingTimeDesc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public List<ResourceBookingResponse> getBookingsByTypeAndDate(String resourceType, LocalDate bookingDate) {
        String normalizedType = normalizeResourceType(resourceType);
        LocalDate targetDate = bookingDate == null ? LocalDate.now() : bookingDate;
        return resourceBookingRepository
                .findByResourceTypeAndBookingDateOrderByBookingTimeAsc(normalizedType, targetDate)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public ResourceBookingResponse createBooking(CreateResourceBookingRequest request, User user) {
        String normalizedType = normalizeResourceType(request.resourceType());
        int durationHours = sanitizeDuration(request.durationHours());
        int requestedQuantity = sanitizeQuantity(request.quantity());

        validateBookingDateTime(request.bookingDate(), request.bookingTime());

        ResourceDefinition resourceDefinition = resolveResourceDefinition(normalizedType, request.resourceId());
        ensureNoConflict(
                normalizedType,
                request.resourceId(),
                request.bookingDate(),
                request.bookingTime(),
                durationHours,
                requestedQuantity,
                null,
                resourceDefinition.availableUnits());

        Instant now = Instant.now();
        ResourceBooking booking = ResourceBooking.builder()
                .resourceType(normalizedType)
                .resourceId(request.resourceId())
                .resourceName(resourceDefinition.name())
                .studentId(user.getId())
                .studentName(user.getName())
                .studentEmail(user.getEmail())
                .bookingDate(request.bookingDate())
                .bookingTime(request.bookingTime())
                .durationHours(durationHours)
                .quantity(requestedQuantity)
                .purpose(request.purpose().trim())
                .status(defaultStatusForType(normalizedType))
                .createdAt(now)
                .updatedAt(now)
                .build();

        ResourceBooking saved = resourceBookingRepository.save(booking);

        notificationService.send(user.getId(), "Booking Created",
                "Your request for " + request.quantity() + "x " + resourceDefinition.name() + " on "
                        + request.bookingDate().toString() + " has been created and is pending approval.",
                "BOOKINGS", saved.getId());

        userRepository.findByRole(com.tech.spcours.paf_smart.module.user.model.Role.ADMIN).forEach(admin -> {
            notificationService.send(admin.getId(), "New Resource Booking",
                    user.getName() + " requested " + request.quantity() + "x " + resourceDefinition.name() + " on "
                            + request.bookingDate().toString() + ".",
                    "BOOKINGS", saved.getId());
        });

        return toResponse(saved);
    }

    public ResourceBookingResponse updateBooking(String bookingId, CreateResourceBookingRequest request, User user) {
        ResourceBooking existingBooking = findOwnedBooking(bookingId, user);

        String normalizedType = normalizeResourceType(request.resourceType());
        int durationHours = sanitizeDuration(request.durationHours());
        int requestedQuantity = sanitizeQuantity(request.quantity());

        validateBookingDateTime(request.bookingDate(), request.bookingTime());

        ResourceDefinition resourceDefinition = resolveResourceDefinition(normalizedType, request.resourceId());
        ensureNoConflict(
                normalizedType,
                request.resourceId(),
                request.bookingDate(),
                request.bookingTime(),
                durationHours,
                requestedQuantity,
                existingBooking.getId(),
                resourceDefinition.availableUnits());

        existingBooking.setResourceType(normalizedType);
        existingBooking.setResourceId(request.resourceId());
        existingBooking.setResourceName(resourceDefinition.name());
        existingBooking.setBookingDate(request.bookingDate());
        existingBooking.setBookingTime(request.bookingTime());
        existingBooking.setDurationHours(durationHours);
        existingBooking.setQuantity(requestedQuantity);
        existingBooking.setPurpose(request.purpose().trim());
        if (existingBooking.getStatus() == null || existingBooking.getStatus().isBlank()) {
            existingBooking.setStatus(defaultStatusForType(normalizedType));
        }
        existingBooking.setUpdatedAt(Instant.now());

        return toResponse(resourceBookingRepository.save(existingBooking));
    }

    public ResourceBookingResponse updateBookingStatus(String bookingId, UpdateBookingStatusRequest request,
            User user) {
        ResourceBooking booking = resourceBookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Resource booking not found"));

        boolean isAdmin = user.getRole() == com.tech.spcours.paf_smart.module.user.model.Role.ADMIN;

        if (!isAdmin) {
            // If not admin, must be the owner and can only set status to CANCELLED
            if (!booking.getStudentId().equals(user.getId())) {
                throw new com.tech.spcours.paf_smart.exception.ResourceConflictException(
                        "You can only update your own bookings");
            }
            if (!"CANCELLED".equalsIgnoreCase(request.status())) {
                throw new com.tech.spcours.paf_smart.exception.ResourceConflictException(
                        "Students can only cancel their bookings");
            }
        }

        booking.setStatus(request.status().toUpperCase());
        if ("REJECTED".equalsIgnoreCase(request.status())) {
            booking.setRejectionReason(request.rejectionReason());
            booking.setCancellationReason(null);
            notificationService.send(booking.getStudentId(), "Booking Rejected",
                    "Your resource booking for " + booking.getResourceName() + " on " + booking.getBookingDate()
                            + " has been rejected. Reason: " + request.rejectionReason(),
                    "BOOKINGS", booking.getId());
        } else if ("CANCELLED".equalsIgnoreCase(request.status())) {
            booking.setCancellationReason(request.cancellationReason());
            booking.setRejectionReason(null);
            notificationService.send(booking.getStudentId(), "Booking Cancelled",
                    "Your resource booking for " + booking.getResourceName() + " on " + booking.getBookingDate()
                            + " has been successfully cancelled.",
                    "BOOKINGS", booking.getId());
        } else if ("APPROVED".equalsIgnoreCase(request.status())) {
            booking.setRejectionReason(null);
            booking.setCancellationReason(null);
            notificationService.send(booking.getStudentId(), "Booking Approved",
                    "Your resource booking for " + booking.getResourceName() + " on " + booking.getBookingDate()
                            + " has been approved.",
                    "BOOKINGS", booking.getId());
        } else {
            booking.setRejectionReason(null);
            booking.setCancellationReason(null);
        }
        booking.setUpdatedAt(Instant.now());

        return toResponse(resourceBookingRepository.save(booking));
    }

    public void deleteBooking(String bookingId, User user) {
        ResourceBooking booking = findOwnedBooking(bookingId, user);
        resourceBookingRepository.delete(booking);
    }

    private ResourceBooking findOwnedBooking(String bookingId, User user) {
        return resourceBookingRepository.findByIdAndStudentId(bookingId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Resource booking not found for this student"));
    }

    private void ensureNoConflict(
            String resourceType,
            String resourceId,
            LocalDate bookingDate,
            LocalTime bookingTime,
            int durationHours,
            int requestedQuantity,
            String excludedBookingId,
            int availableUnits) {
        List<ResourceBooking> dayBookings = resourceBookingRepository
                .findByResourceTypeAndBookingDateOrderByBookingTimeAsc(resourceType, bookingDate);

        int overlappingEquipmentUnits = dayBookings.stream()
                .filter(existing -> excludedBookingId == null || !excludedBookingId.equals(existing.getId()))
                .filter(this::isBlockingStatus)
                .filter(existing -> resourceId.equals(existing.getResourceId()))
                .filter(existing -> isOverlappingSlot(
                        existing.getBookingTime(),
                        sanitizeDuration(existing.getDurationHours()),
                        bookingTime,
                        durationHours))
                .mapToInt(existing -> sanitizeQuantity(existing.getQuantity()))
                .sum();

        if (!"EQUIPMENT".equals(resourceType) && overlappingEquipmentUnits > 0) {
            throw new ResourceConflictException("This resource is already reserved for the selected slot");
        }

        if ("EQUIPMENT".equals(resourceType)) {
            int currentlyAvailableUnits = Math.max(0, availableUnits - overlappingEquipmentUnits);
            if (requestedQuantity > currentlyAvailableUnits) {
                throw new ResourceConflictException(
                        "Only " + currentlyAvailableUnits + " unit(s) are available for the selected slot");
            }
        }
    }

    private ResourceDefinition resolveResourceDefinition(String resourceType, String resourceId) {
        if ("EQUIPMENT".equals(resourceType)) {
            var equipment = equipmentRepository.findById(resourceId)
                    .orElseThrow(() -> new ResourceNotFoundException("Equipment resource not found"));
            int availableUnits = equipment.getAvailableQuantity() == null ? 0 : equipment.getAvailableQuantity();
            return new ResourceDefinition(equipment.getName(), availableUnits);
        }

        var facility = facilityRepository.findById(resourceId)
                .orElseThrow(() -> new ResourceNotFoundException("Facility resource not found"));

        String facilityCategory = resolveFacilityCategory(facility.getSpaceType());
        if (!resourceType.equals(facilityCategory)) {
            throw new ResourceConflictException("Selected resource does not belong to " + resourceType + " category");
        }

        return new ResourceDefinition(facility.getName(), 1);
    }

    private String defaultStatusForType(String resourceType) {
        return "PENDING_APPROVAL";
    }

    private String normalizeResourceType(String rawType) {
        if (rawType == null || rawType.isBlank()) {
            throw new ResourceConflictException("Resource type is required");
        }

        String normalized = rawType.trim().toUpperCase();
        if (!SUPPORTED_TYPES.contains(normalized)) {
            throw new ResourceConflictException("Unsupported resource type");
        }
        return normalized;
    }

    private String resolveFacilityCategory(String rawSpaceType) {
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
        return "FACILITY";
    }

    private void validateBookingDateTime(LocalDate bookingDate, LocalTime bookingTime) {
        if (bookingDate == null || bookingTime == null) {
            throw new ResourceConflictException("Booking date and time are required");
        }
        if (bookingDate.isBefore(LocalDate.now())) {
            throw new ResourceConflictException("Booking date cannot be in the past");
        }
        if (bookingDate.isEqual(LocalDate.now()) && bookingTime.isBefore(LocalTime.now())) {
            throw new ResourceConflictException("Booking time cannot be in the past");
        }
    }

    private boolean isBlockingStatus(ResourceBooking booking) {
        String normalizedStatus = String.valueOf(booking.getStatus()).trim().toUpperCase();
        return !"CANCELLED".equals(normalizedStatus) && !"REJECTED".equals(normalizedStatus);
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

    private int sanitizeQuantity(Integer value) {
        if (value == null || value < 1) {
            return 1;
        }
        return value;
    }

    private int sanitizeDuration(Integer value) {
        if (value == null || value < 1) {
            return 1;
        }
        if (value > 12) {
            return 12;
        }
        return value;
    }

    private ResourceBookingResponse toResponse(ResourceBooking booking) {
        return ResourceBookingResponse.builder()
                .id(booking.getId())
                .resourceType(booking.getResourceType())
                .resourceId(booking.getResourceId())
                .resourceName(booking.getResourceName())
                .studentId(booking.getStudentId())
                .studentName(booking.getStudentName())
                .studentEmail(booking.getStudentEmail())
                .bookingDate(booking.getBookingDate())
                .bookingTime(booking.getBookingTime())
                .durationHours(booking.getDurationHours())
                .quantity(booking.getQuantity())
                .purpose(booking.getPurpose())
                .status(booking.getStatus())
                .rejectionReason(booking.getRejectionReason())
                .cancellationReason(booking.getCancellationReason())
                .createdAt(booking.getCreatedAt())
                .updatedAt(booking.getUpdatedAt())
                .build();
    }

    private record ResourceDefinition(String name, int availableUnits) {
    }
}
