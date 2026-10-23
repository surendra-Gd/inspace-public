package com.backend.demo.post;

import com.backend.demo.exception.OperationFailedException;
import org.apache.tika.Tika;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.*;
import java.util.Map;
import java.util.Set;

@Service
public class ImageService {

    private static final Logger logger = LoggerFactory.getLogger(ImageService.class);
    private static final Tika tika = new Tika();
    private static final Map<String, Set<String>> MIME_TO_EXTENSIONS = Map.of(
            "image/jpeg", Set.of("jpg", "jpeg"),
            "image/png", Set.of("png")
    );

    private static final long MAX_FILE_SIZE = 2 * 1024 * 1024;

    public void processImage(MultipartFile file) {
        try {
            if (file.getSize() > MAX_FILE_SIZE) {
                throw new OperationFailedException("Error: File too large. Max size is " + MAX_FILE_SIZE / (1024 * 1024) + "MB");
            }

            try (InputStream inputStream = new BufferedInputStream(file.getInputStream())) {
                validateImage(inputStream, file.getOriginalFilename());
            }
        } catch (IOException e) {
            logger.error("Error processing the image: {}", e.getMessage(), e);
            throw new OperationFailedException("Image processing failed");
        }
    }

    private void validateImage(InputStream inputStream, String originalFilename) throws IOException {
        // Validate MIME type directly
        String mimeType = tika.detect(inputStream);

        if (!MIME_TO_EXTENSIONS.containsKey(mimeType)) {
            logger.error("Unsupported MIME type: {} for file: {}", mimeType, originalFilename);
            throw new OperationFailedException("The uploaded file must be a JPG or PNG image.");
        }

        // Validate file extension
        if (!isExtensionValid(originalFilename, mimeType)) {
            logger.error("File extension does not match MIME type: {} for file: {}", mimeType, originalFilename);
            throw new OperationFailedException("File extension does not match the content.");
        }

        // Validate image content (ensure it’s a valid image file)
        BufferedImage img = ImageIO.read(inputStream);
        if (img == null) {
            logger.error("Invalid image content for file: {}", originalFilename);
            throw new OperationFailedException("The image is corrupted or unsupported.");
        }
    }

    private boolean isExtensionValid(String filename, String mimeType) {
        if (filename == null || !filename.contains(".")) {
            return false;
        }
        String extension = filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();
        return MIME_TO_EXTENSIONS.get(mimeType).contains(extension);
    }

    public int[] getImageDimensions(MultipartFile file) throws IOException {
        try (InputStream inputStream = new BufferedInputStream(file.getInputStream())) {
            BufferedImage image = ImageIO.read(inputStream);
            if (image == null) {
                throw new OperationFailedException("Error: Unable to read image dimensions");
            }
            return new int[]{image.getWidth(), image.getHeight()};
        }
    }

    public String getAspectRatio(int width, int height) {
        double aspectRatio = (double) width / height;

        if (Math.abs(aspectRatio - 1.0) < 0.01) {
            return "1/1";
        } else if (Math.abs(aspectRatio - (3.0 / 4.0)) < 0.01) {
            return "3/4";
        } else if (Math.abs(aspectRatio - (4.0 / 3.0)) < 0.01) {
            return "4/3";
        } else if (Math.abs(aspectRatio - (4.0 / 5.0)) < 0.01) {
            return "4/5";
        } else {
            return "3/4";
        }
    }

    public String detectMimeType(InputStream is) {
        try {
            return tika.detect(is);
        } catch (IOException e) {
            logger.error("Error detecting MIME type: {}", e.getMessage(), e);
            return "unknown";
        }
    }

    public String determineExtension(String type) {
        return switch (type.toLowerCase()) {
            case "image/jpeg" -> ".jpeg";
            case "image/jpg" -> ".jpg";
            case "image/png" -> ".png";
            default -> throw new IllegalArgumentException("Unsupported image type: " + type);
        };
    }
}
