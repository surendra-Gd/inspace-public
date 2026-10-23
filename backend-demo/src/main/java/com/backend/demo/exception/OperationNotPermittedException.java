package com.backend.demo.exception;


import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(code = HttpStatus.BAD_REQUEST)
public class OperationNotPermittedException extends RuntimeException {

    public OperationNotPermittedException(String message) {
        super(message);
    }
}
