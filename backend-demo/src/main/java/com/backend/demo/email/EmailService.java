package com.backend.demo.email;

import com.backend.demo.exception.EmailSendingException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

@Service
public class EmailService implements EmailSender{

    @Value("${mailgun.api.key}")
    private String apiKey;

    @Value("${mailgun.domain}")
    private String domain;

    private final RestTemplate restTemplate;

    public EmailService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }


    @Async
    @Override
    public void sendEmail(String to, String subject, String templateName, Map<String, String> variables) {
        String mailgunUrl = "https://api.mailgun.net/v3/" + domain + "/messages";

        // Set headers with Mailgun authentication
        HttpHeaders headers = new HttpHeaders();
        headers.setBasicAuth("api", apiKey);
        headers.add("Content-Type", "application/x-www-form-urlencoded");

        // Request body with email data
        MultiValueMap<String, String> requestBody = new LinkedMultiValueMap<>();
        requestBody.add("from", "InSpace <no-reply@" + domain + ">");
        requestBody.add("to", to);
        requestBody.add("subject", subject);
        requestBody.add("template", templateName);

        // Add template variables to request body
        variables.forEach((key, value) -> requestBody.add("v:" + key, value));

        // Send the email using RestTemplate
        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(requestBody, headers);
        System.out.println(request);
        ResponseEntity<String> response = restTemplate.postForEntity(mailgunUrl, request, String.class);

        if (response.getStatusCode().is2xxSuccessful()) {
            System.out.println("Email sent successfully using template.");
        } else {
            throw new EmailSendingException("Failed to send email: " + response.getBody());
        }
    }


    @Async
    @Override
    public void sendUserFeedBack(
            String username, String scenario, String feedbackMessage, String description
    ) {
        var to = "contact@theinspace.net";
        var subject = "User Action Feedback From " + username;
        var template = "user-action-feedback-template";


        Map<String, String> variables = new HashMap<>();
        variables.put("username", username);
        variables.put("body", sanitizeContent(feedbackMessage));
        variables.put("scenario", scenario);
        variables.put("description", description);

        // Format the timestamp
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        String formattedTimestamp = LocalDateTime.now().format(formatter);
        variables.put("timestamp", formattedTimestamp);

        sendEmail(to, subject, template, variables);
    }

    private String sanitizeContent(String content) {
        return content
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#x27;");
    }
}