package com.tech.spcours.paf_smart.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.tech.spcours.paf_smart.dto.CreateResourceBookingRequest;
import com.tech.spcours.paf_smart.dto.ResourceBookingResponse;
import com.tech.spcours.paf_smart.dto.UpdateBookingStatusRequest;
import com.tech.spcours.paf_smart.module.user.model.User;
import com.tech.spcours.paf_smart.service.ResourceBookingService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/resource-bookings")
@RequiredArgsConstructor
public class ResourceBookingController {

    private final ResourceBookingService resourceBookingService;

    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public List<ResourceBookingResponse> getMyBookings(
            org.springframework.security.core.Authentication auth,
            @RequestParam String type) {
        User user = (User) auth.getPrincipal();
        return resourceBookingService.getMyBookings(user, type);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public List<ResourceBookingResponse> getBookingsByTypeAndDate(
            @RequestParam String type,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return resourceBookingService.getBookingsByTypeAndDate(type, date);
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public List<ResourceBookingResponse> getAllBookings() {
        return resourceBookingService.getAllBookings();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResourceBookingResponse createBooking(
            @Valid @RequestBody CreateResourceBookingRequest request,
            org.springframework.security.core.Authentication auth) {
        User user = (User) auth.getPrincipal();
        return resourceBookingService.createBooking(request, user);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResourceBookingResponse updateBooking(
            @PathVariable String id,
            @Valid @RequestBody CreateResourceBookingRequest request,
            org.springframework.security.core.Authentication auth) {
        User user = (User) auth.getPrincipal();
        return resourceBookingService.updateBooking(id, request, user);
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResourceBookingResponse updateBookingStatus(
            @PathVariable String id,
            @Valid @RequestBody UpdateBookingStatusRequest request) {
        return resourceBookingService.updateBookingStatus(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public void deleteBooking(
            @PathVariable String id,
            org.springframework.security.core.Authentication auth) {
        User user = (User) auth.getPrincipal();
        resourceBookingService.deleteBooking(id, user);
    }
}
