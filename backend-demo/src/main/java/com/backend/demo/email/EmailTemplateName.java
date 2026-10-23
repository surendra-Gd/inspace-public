package com.backend.demo.email;

import lombok.Getter;


@Getter
public enum EmailTemplateName {
    /**
     * Template for activating a new user's account.
     */
    ACTIVATE_ACCOUNT("activate-account-template", "Complete Your InSpace Registration: Activate Your Account Now"),

    /**
     * Template for resetting a user's password.
     */
    RESET_PASSWORD("reset-password-template", "Forgot Your Password? Reset It for InSpace"),

    /**
     * Template for verifying a user's email address.
     */
    VERIFY_EMAIL("verify-email-template", "Confirm Your Email Address to Start Using InSpace");

    private final String name;
    private final String subject;

    EmailTemplateName(String name, String subject) {
        this.name = name;
        this.subject = subject;
    }
}

