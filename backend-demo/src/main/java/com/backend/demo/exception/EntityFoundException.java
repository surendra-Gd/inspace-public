package com.backend.demo.exception;

import lombok.Getter;

@Getter
public class EntityFoundException extends RuntimeException{
    private final String error;
    private final Long entityId;

    public EntityFoundException(
            String message, Long entityId, String error
    ) {
        super(message);
        this.entityId = entityId;
        this.error = error;
    }
}
