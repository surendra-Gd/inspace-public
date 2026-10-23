package com.backend.demo.email;


import java.util.Map;

public interface EmailSender {


    void sendEmail(String to, String subject, String templateName, Map<String, String> variables);

    void sendUserFeedBack(String username, String scenario, String feedbackMessage, String description);
}
