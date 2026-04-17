package com.tech.spcours.paf_smart.repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.tech.spcours.paf_smart.model.FacilityBooking;

public interface FacilityBookingRepository extends MongoRepository<FacilityBooking, String> {

    boolean existsByLectureHallCodeAndBookingDateAndBookingTime(
            String lectureHallCode,
            LocalDate bookingDate,
            LocalTime bookingTime);

    boolean existsByStudentIdAndBookingDateAndBookingTime(
            String studentId,
            LocalDate bookingDate,
            LocalTime bookingTime);

    List<FacilityBooking> findByStudentIdOrderByBookingDateDescBookingTimeDesc(String studentId);
}
