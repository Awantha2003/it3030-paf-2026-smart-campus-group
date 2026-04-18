package com.tech.spcours.paf_smart.controller;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/uploads")
public class FileUploadController {

    private final Path fileStorageLocation;
    private final Cloudinary cloudinary;
    private final boolean cloudinaryEnabled;
    private final String cloudinaryFolder;

    public FileUploadController(
            @Value("${app.cloudinary.enabled:false}") boolean cloudinaryEnabled,
            @Value("${app.cloudinary.url:}") String cloudinaryUrl,
            @Value("${app.cloudinary.cloud-name:}") String cloudinaryCloudName,
            @Value("${app.cloudinary.api-key:}") String cloudinaryApiKey,
            @Value("${app.cloudinary.api-secret:}") String cloudinaryApiSecret,
            @Value("${app.cloudinary.folder:unistudyhub/profile-images}") String cloudinaryFolder) {
        this.fileStorageLocation = Paths.get("uploads").toAbsolutePath().normalize();
        this.cloudinaryEnabled = cloudinaryEnabled;
        this.cloudinaryFolder = cloudinaryFolder;
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Could not create the directory where the uploaded files will be stored.", ex);
        }

        if (StringUtils.hasText(cloudinaryUrl)) {
            this.cloudinary = new Cloudinary(cloudinaryUrl);
        } else {
            this.cloudinary = new Cloudinary(ObjectUtils.asMap(
                    "cloud_name", cloudinaryCloudName,
                    "api_key", cloudinaryApiKey,
                    "api_secret", cloudinaryApiSecret,
                    "secure", true));
        }

        this.cloudinary.config.secure = true;
    }

    @PostMapping
    public ResponseEntity<?> uploadFile(@RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Please choose a PNG image to upload."));
            }

            String contentType = file.getContentType();
            if (!MediaType.IMAGE_PNG_VALUE.equalsIgnoreCase(contentType)) {
                return ResponseEntity.badRequest().body(Map.of("error", "Only PNG attachments are supported."));
            }

            String originalFileName = StringUtils.cleanPath(file.getOriginalFilename());
            String sanitizedBaseName = originalFileName.replaceFirst("[.][^.]+$", "").replaceAll("[^a-zA-Z0-9-_]", "_");
            if (sanitizedBaseName.isBlank()) {
                sanitizedBaseName = "attachment";
            }

            if (cloudinaryEnabled) {
                String publicId = sanitizedBaseName + "_" + UUID.randomUUID();
                Map<String, Object> uploadOptions = new HashMap<>();
                uploadOptions.put("folder", cloudinaryFolder);
                uploadOptions.put("public_id", publicId);
                uploadOptions.put("resource_type", "image");
                uploadOptions.put("overwrite", false);

                @SuppressWarnings("unchecked")
                Map<String, Object> uploadResult = cloudinary.uploader().upload(file.getBytes(), uploadOptions);
                String secureUrl = String.valueOf(uploadResult.getOrDefault("secure_url", ""));

                if (!StringUtils.hasText(secureUrl)) {
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                            .body(Map.of("error", "Cloudinary upload succeeded without a secure URL."));
                }

                return ResponseEntity.ok(Map.of(
                        "url", secureUrl,
                        "provider", "cloudinary",
                        "folder", cloudinaryFolder));
            }

            String fileName = UUID.randomUUID() + "_" + sanitizedBaseName + ".png";
            Path targetLocation = this.fileStorageLocation.resolve(fileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            String fileDownloadUri = "/api/uploads/" + fileName;

            return ResponseEntity.ok(Map.of(
                    "url", fileDownloadUri,
                    "provider", "local",
                    "folder", "uploads"));
        } catch (IOException ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Could not store file " + file.getOriginalFilename() + ". Please try again!"));
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Cloudinary upload failed. " + ex.getMessage()));
        }
    }

    @GetMapping("/{fileName:.+}")
    public ResponseEntity<Resource> downloadFile(@PathVariable String fileName) {
        try {
            Path filePath = this.fileStorageLocation.resolve(fileName).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists()) {
                String contentType = Files.probeContentType(filePath);
                MediaType mediaType = contentType != null
                        ? MediaType.parseMediaType(contentType)
                        : MediaType.APPLICATION_OCTET_STREAM;

                return ResponseEntity.ok()
                        .contentType(mediaType)
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
