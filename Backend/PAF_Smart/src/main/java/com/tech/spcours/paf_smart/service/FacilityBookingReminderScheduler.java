package com.tech.spcours.paf_smart.service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.tech.spcours.paf_smart.model.FacilityBooking;
import com.tech.spcours.paf_smart.repository.FacilityBookingRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class FacilityBookingReminderScheduler {

    private static final Logger log = LoggerFactory.getLogger(FacilityBookingReminderScheduler.class);

    private final FacilityBookingRepository facilityBookingRepository;
    private final MailjetEmailService mailjetEmailService;

    @Value("${app.facility-booking.reminders.enabled:true}")
    private boolean remindersEnabled;

    @Value("${app.facility-booking.reminders.before-minutes:10}")
    private long reminderMinutesBefore;

    @Value("${app.facility-booking.reminders.timezone:Asia/Colombo}")
    private String remindersTimezone;

    @Scheduled(fixedDelayString = "${app.facility-booking.reminders.scan-interval-ms:60000}")
    public void sendDueReminders() {
        if (!remindersEnabled) {
            return;
        }

        ZoneId zoneId = resolveZoneId();
        ZonedDateTime now = ZonedDateTime.now(zoneId);
        LocalDate today = now.toLocalDate();
        LocalDate tomorrow = today.plusDays(1);

        List<FacilityBooking> pendingBookings =
                facilityBookingRepository.findByStatusAndReminderSentAtIsNullAndBookingDateBetween(
                        "AVAILABLE",
                        today,
                        tomorrow);

        for (FacilityBooking booking : pendingBookings) {
            if (!isReminderDue(booking, now, zoneId)) {
                continue;
            }

            ZonedDateTime startTime = ZonedDateTime.of(booking.getBookingDate(), booking.getBookingTime(), zoneId);
            EmailDeliveryResult result =
                    mailjetEmailService.sendFacilityBookingReminderEmail(booking, startTime, reminderMinutesBefore);

            if (result.sent()) {
                booking.setReminderSentAt(Instant.now());
                booking.setUpdatedAt(Instant.now());
                facilityBookingRepository.save(booking);
                continue;
            }

            log.warn(
                    "Failed to send facility reminder for booking {} to {}: {}",
                    booking.getId(),
                    booking.getStudentEmail(),
                    result.message());
        }
    }

    private boolean isReminderDue(FacilityBooking booking, ZonedDateTime now, ZoneId zoneId) {
        if (booking == null
                || booking.getBookingDate() == null
                || booking.getBookingTime() == null
                || booking.getReminderSentAt() != null) {
            return false;
        }

        ZonedDateTime slotStart = ZonedDateTime.of(booking.getBookingDate(), booking.getBookingTime(), zoneId);
        ZonedDateTime reminderTime = slotStart.minusMinutes(reminderMinutesBefore);

        return !now.isBefore(reminderTime) && now.isBefore(slotStart);
    }

    private ZoneId resolveZoneId() {
        try {
            return ZoneId.of(remindersTimezone);
        } catch (Exception ex) {
            log.warn("Invalid reminder timezone '{}'. Falling back to system default.", remindersTimezone);
            return ZoneId.systemDefault();
        }
    }
}
