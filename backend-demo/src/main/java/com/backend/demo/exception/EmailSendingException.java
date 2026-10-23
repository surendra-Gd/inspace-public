package com.backend.demo.exception;

import lombok.Getter;

@Getter
public class EmailSendingException extends RuntimeException {
    public EmailSendingException(String message) {
        super(message);
    }
}
