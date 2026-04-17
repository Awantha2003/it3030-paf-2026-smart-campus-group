package com.tech.spcours.paf_smart.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.tech.spcours.paf_smart.dto.CreateFacilityBookingRequest;
import com.tech.spcours.paf_smart.dto.FacilityBookingResponse;
import com.tech.spcours.paf_smart.dto.FacilityLectureHallResponse;
import com.tech.spcours.paf_smart.module.user.model.User;
import com.tech.spcours.paf_smart.service.FacilityBookingService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/facility-bookings")
@RequiredArgsConstructor
public class FacilityBookingController {

    private final FacilityBookingService facilityBookingService;

    @GetMapping("/lecture-halls")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public List<FacilityLectureHallResponse> getLectureHalls() {
        return facilityBookingService.getLectureHalls();
    }

    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public List<FacilityBookingResponse> getMyBookings(org.springframework.security.core.Authentication auth) {
        User user = (User) auth.getPrincipal();
        return facilityBookingService.getStudentBookings(user);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public FacilityBookingResponse createBooking(
            @Valid @RequestBody CreateFacilityBookingRequest request,
            org.springframework.security.core.Authentication auth) {
        User user = (User) auth.getPrincipal();
        return facilityBookingService.createBooking(request, user);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public FacilityBookingResponse updateBooking(
            @PathVariable String id,
            @Valid @RequestBody CreateFacilityBookingRequest request,
            org.springframework.security.core.Authentication auth) {
        User user = (User) auth.getPrincipal();
        return facilityBookingService.updateBooking(id, request, user);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public void deleteBooking(
            @PathVariable String id,
            org.springframework.security.core.Authentication auth) {
        User user = (User) auth.getPrincipal();
        facilityBookingService.deleteBooking(id, user);
    }
}
