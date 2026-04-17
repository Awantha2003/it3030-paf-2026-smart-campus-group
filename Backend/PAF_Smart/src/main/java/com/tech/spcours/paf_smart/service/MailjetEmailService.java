package com.tech.spcours.paf_smart.service;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Base64;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;

import com.tech.spcours.paf_smart.model.FacilityBooking;
import com.tech.spcours.paf_smart.model.TechnicianMember;

@Service
public class MailjetEmailService {

    private static final String MAILJET_SEND_URL = "https://api.mailjet.com/v3.1/send";

    private final HttpClient httpClient = HttpClient.newHttpClient();

    @Value("${app.mailjet.enabled:false}")
    private boolean mailjetEnabled;

    @Value("${app.mailjet.api-key:}")
    private String apiKey;

    @Value("${app.mailjet.secret-key:}")
    private String secretKey;

    @Value("${app.mailjet.from-email:}")
    private String fromEmail;

    @Value("${app.mailjet.from-name:Smart Campus}")
    private String fromName;

    public EmailDeliveryResult sendTechnicianCredentialsEmail(TechnicianMember technicianMember, String rawPassword) {
        String subject = "Your Smart Campus Technician Account";
        String textPart = buildTextPart(technicianMember, rawPassword);
        String htmlPart = buildHtmlPart(technicianMember, rawPassword);
        return sendEmail(
                technicianMember.getEmail(),
                technicianMember.getFullName(),
                subject,
                textPart,
                htmlPart,
                "Failed to send credentials email via Mailjet",
                "Credentials email sent successfully");
    }

    public EmailDeliveryResult sendFacilityBookingReminderEmail(
            FacilityBooking booking,
            ZonedDateTime bookingStartTime,
            long reminderMinutesBefore) {
        if (booking == null || isBlank(booking.getStudentEmail())) {
            return EmailDeliveryResult.failed("Cannot send reminder email without student email");
        }

        String recipientName = isBlank(booking.getStudentName()) ? "Student" : booking.getStudentName();
        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("EEEE, dd MMM yyyy");
        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("hh:mm a");

        String formattedDate = bookingStartTime.format(dateFormatter);
        String formattedTime = bookingStartTime.format(timeFormatter);
        String subject = "Reminder: Facility booking starts in " + reminderMinutesBefore + " minutes";

        String textPart = """
                Hello %s,

                This is a reminder for your Smart Campus facility booking.

                Lecture Hall: %s (%s)
                Date: %s
                Time: %s
                Building: %s | Block: %s | Floor: %s
                Faculty: %s

                Please be on time for your booking.
                """
                .formatted(
                        recipientName,
                        safe(booking.getLectureHallName()),
                        safe(booking.getLectureHallCode()),
                        formattedDate,
                        formattedTime,
                        safe(booking.getBuilding()),
                        safe(booking.getBlock()),
                        booking.getFloor() == null ? "-" : booking.getFloor(),
                        safe(booking.getFaculty()));

        String htmlPart = """
                <div style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.6; max-width: 560px; margin: 0 auto;">
                  <h2 style="margin-bottom: 8px;">Facility Booking Reminder</h2>
                  <p>Hello %s,</p>
                  <p>Your Smart Campus booking starts in <strong>%s minutes</strong>.</p>
                  <div style="background: #f3f4f6; border-radius: 8px; padding: 16px; margin: 16px 0;">
                    <p style="margin: 0 0 8px;"><strong>Lecture Hall:</strong> %s (%s)</p>
                    <p style="margin: 0 0 8px;"><strong>Date:</strong> %s</p>
                    <p style="margin: 0 0 8px;"><strong>Time:</strong> %s</p>
                    <p style="margin: 0 0 8px;"><strong>Location:</strong> %s | Block %s | Floor %s</p>
                    <p style="margin: 0;"><strong>Faculty:</strong> %s</p>
                  </div>
                  <p>Please be on time for your booking.</p>
                  <p style="font-size: 12px; color: #6b7280; margin-top: 24px;">Smart Campus automated notification</p>
                </div>
                """
                .formatted(
                        recipientName,
                        reminderMinutesBefore,
                        safe(booking.getLectureHallName()),
                        safe(booking.getLectureHallCode()),
                        formattedDate,
                        formattedTime,
                        safe(booking.getBuilding()),
                        safe(booking.getBlock()),
                        booking.getFloor() == null ? "-" : booking.getFloor(),
                        safe(booking.getFaculty()));

        return sendEmail(
                booking.getStudentEmail(),
                recipientName,
                subject,
                textPart,
                htmlPart,
                "Failed to send facility booking reminder email",
                "Facility booking reminder email sent successfully");
    }

    private EmailDeliveryResult sendEmail(
            String recipientEmail,
            String recipientName,
            String subject,
            String textPart,
            String htmlPart,
            String failureMessage,
            String successMessage) {
        if (!mailjetEnabled) {
            return EmailDeliveryResult.failed("Mailjet email sending is disabled");
        }

        if (isBlank(apiKey) || isBlank(secretKey) || isBlank(fromEmail)) {
            return EmailDeliveryResult.failed("Mailjet configuration is incomplete");
        }

        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(MAILJET_SEND_URL))
                    .header("Authorization", basicAuthHeader())
                    .header("Content-Type", MediaType.APPLICATION_JSON_VALUE)
                    .POST(HttpRequest.BodyPublishers.ofString(
                            buildPayload(recipientEmail, recipientName, subject, textPart, htmlPart)))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                return EmailDeliveryResult.success(successMessage);
            }

            return EmailDeliveryResult.failed("Mailjet rejected the email request");
        } catch (IOException | InterruptedException exception) {
            if (exception instanceof InterruptedException) {
                Thread.currentThread().interrupt();
            }
            return EmailDeliveryResult.failed(failureMessage);
        }
    }

    private String buildPayload(
            String recipientEmail,
            String recipientName,
            String subject,
            String textPart,
            String htmlPart) {
        return """
                {
                  "Messages": [
                    {
                      "From": {
                        "Email": "%s",
                        "Name": "%s"
                      },
                      "To": [
                        {
                          "Email": "%s",
                          "Name": "%s"
                        }
                      ],
                      "Subject": "%s",
                      "TextPart": "%s",
                      "HTMLPart": "%s"
                    }
                  ]
                }
                """.formatted(
                escapeJson(fromEmail),
                escapeJson(fromName),
                escapeJson(recipientEmail),
                escapeJson(recipientName),
                escapeJson(subject),
                escapeJson(textPart),
                escapeJson(htmlPart));
    }

    private String buildTextPart(TechnicianMember technicianMember, String rawPassword) {
        return """
                Hello %s,

                Your Smart Campus technician account has been created.

                Please use the temporary credentials below to sign in once and change your password immediately.

                Email: %s
                Password: %s
                Department: %s
                Specialization: %s

                If you were not expecting this email, please contact support.
                """
                .formatted(
                        technicianMember.getFullName(),
                        technicianMember.getEmail(),
                        rawPassword,
                        technicianMember.getDepartment(),
                        technicianMember.getSpecialization());
    }

    private String safe(String value) {
        return isBlank(value) ? "-" : value;
    }

    private String buildHtmlPart(TechnicianMember technicianMember, String rawPassword) {
        return """
                <div style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.6; max-width: 560px; margin: 0 auto;">
                  <h2 style="margin-bottom: 8px;">Smart Campus Technician Account</h2>
                  <p>Hello %s,</p>
                  <p>Your technician account has been created. Please use the temporary credentials below to sign in once and change your password immediately.</p>
                  <div style="background: #f3f4f6; border-radius: 8px; padding: 16px; margin: 16px 0;">
                    <p style="margin: 0 0 8px;"><strong>Email:</strong> %s</p>
                    <p style="margin: 0 0 8px;"><strong>Password:</strong> %s</p>
                    <p style="margin: 0 0 8px;"><strong>Department:</strong> %s</p>
                    <p style="margin: 0;"><strong>Specialization:</strong> %s</p>
                  </div>
                  <p style="margin-top: 16px;">If you were not expecting this email, please contact support.</p>
                  <p style="font-size: 12px; color: #6b7280; margin-top: 24px;">Smart Campus automated notification</p>
                </div>
                """
                .formatted(
                        technicianMember.getFullName(),
                        technicianMember.getEmail(),
                        rawPassword,
                        technicianMember.getDepartment(),
                        technicianMember.getSpecialization());
    }

    private String basicAuthHeader() {
        String credentials = apiKey + ":" + secretKey;
        String encoded = Base64.getEncoder().encodeToString(credentials.getBytes(StandardCharsets.UTF_8));
        return "Basic " + encoded;
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private String escapeJson(String value) {
        if (value == null) {
            return "";
        }

        StringBuilder escaped = new StringBuilder();
        for (char character : value.toCharArray()) {
            switch (character) {
                case '\\' -> escaped.append("\\\\");
                case '"' -> escaped.append("\\\"");
                case '\n' -> escaped.append("\\n");
                case '\r' -> escaped.append("\\r");
                case '\t' -> escaped.append("\\t");
                default -> escaped.append(character);
            }
        }
        return escaped.toString();
    }
}
