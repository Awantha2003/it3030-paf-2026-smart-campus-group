package com.tech.spcours.paf_smart.repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

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

    boolean existsByLectureHallCodeAndBookingDateAndBookingTimeAndIdNot(
            String lectureHallCode,
            LocalDate bookingDate,
            LocalTime bookingTime,
            String id);

    boolean existsByStudentIdAndBookingDateAndBookingTimeAndIdNot(
            String studentId,
            LocalDate bookingDate,
            LocalTime bookingTime,
            String id);

    Optional<FacilityBooking> findByIdAndStudentId(String id, String studentId);

    List<FacilityBooking> findByStudentIdOrderByBookingDateDescBookingTimeDesc(String studentId);

    List<FacilityBooking> findByBookingDate(LocalDate bookingDate);

    List<FacilityBooking> findByLectureHallCodeAndBookingDate(String lectureHallCode, LocalDate bookingDate);

    List<FacilityBooking> findByStudentIdAndBookingDate(String studentId, LocalDate bookingDate);

    List<FacilityBooking> findAllByOrderByBookingDateDescBookingTimeDesc();

    List<FacilityBooking> findByStatusAndReminderSentAtIsNullAndBookingDateBetween(
            String status,
            LocalDate startDate,
            LocalDate endDate);
}
