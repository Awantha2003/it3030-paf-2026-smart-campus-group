package com.tech.spcours.paf_smart.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.tech.spcours.paf_smart.model.ResourceBooking;

public interface ResourceBookingRepository extends MongoRepository<ResourceBooking, String> {

    List<ResourceBooking> findByStudentIdAndResourceTypeOrderByBookingDateDescBookingTimeDesc(
            String studentId,
            String resourceType);

    List<ResourceBooking> findByResourceTypeAndBookingDateOrderByBookingTimeAsc(
            String resourceType,
            LocalDate bookingDate);

    Optional<ResourceBooking> findByIdAndStudentId(String id, String studentId);

    List<ResourceBooking> findAllByOrderByBookingDateDescBookingTimeDesc();
}
