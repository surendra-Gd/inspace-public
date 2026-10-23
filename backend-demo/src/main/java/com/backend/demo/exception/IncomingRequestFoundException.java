package com.backend.demo.exception;

import lombok.Getter;

@Getter
public class IncomingRequestFoundException extends RuntimeException{
    private final Long requestId;
    private final String error;


    public IncomingRequestFoundException(
            String message, Long requestId, String error
    ) {
        super(message);
        this.requestId = requestId;
        this.error = error;
    }

}
