package com.tech.spcours.paf_smart.service;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;

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
                    .POST(HttpRequest.BodyPublishers.ofString(buildPayload(technicianMember, rawPassword)))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                return EmailDeliveryResult.success();
            }

            return EmailDeliveryResult.failed("Mailjet rejected the email request");
        } catch (IOException | InterruptedException exception) {
            if (exception instanceof InterruptedException) {
                Thread.currentThread().interrupt();
            }
            return EmailDeliveryResult.failed("Failed to send credentials email via Mailjet");
        }
    }

    private String buildPayload(TechnicianMember technicianMember, String rawPassword) {
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
                      "Subject": "Your Smart Campus Technician Account",
                      "TextPart": "%s",
                      "HTMLPart": "%s"
                    }
                  ]
                }
                """.formatted(
                escapeJson(fromEmail),
                escapeJson(fromName),
                escapeJson(technicianMember.getEmail()),
                escapeJson(technicianMember.getFullName()),
                escapeJson(buildTextPart(technicianMember, rawPassword)),
                escapeJson(buildHtmlPart(technicianMember, rawPassword)));
    }

    private String buildTextPart(TechnicianMember technicianMember, String rawPassword) {
        return """
                Hello %s,

                Your Smart Campus technician account has been created.

                Email: %s
                Password: %s
                Department: %s
                Specialization: %s

                Please sign in and change this password as soon as possible.
                """
                .formatted(
                        technicianMember.getFullName(),
                        technicianMember.getEmail(),
                        rawPassword,
                        technicianMember.getDepartment(),
                        technicianMember.getSpecialization());
    }

    private String buildHtmlPart(TechnicianMember technicianMember, String rawPassword) {
        return """
                <h3>Hello %s,</h3>
                <p>Your Smart Campus technician account has been created.</p>
                <p><strong>Email:</strong> %s</p>
                <p><strong>Password:</strong> %s</p>
                <p><strong>Department:</strong> %s</p>
                <p><strong>Specialization:</strong> %s</p>
                <p>Please sign in and change this password as soon as possible.</p>
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
