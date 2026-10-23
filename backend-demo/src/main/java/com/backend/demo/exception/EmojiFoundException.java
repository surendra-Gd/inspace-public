package com.backend.demo.exception;

import com.backend.demo.dto.EmojiDTO;
import lombok.Getter;

@Getter
public class EmojiFoundException extends RuntimeException{
    private final String error;
    private final EmojiDTO payload;

    public EmojiFoundException(
            String message, EmojiDTO payload, String error
    ) {
        super(message);
        this.error = error;
        this.payload = payload;
    }
}