package com.backend.demo.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(code = HttpStatus.BAD_REQUEST)
public class PasswordValidateException extends RuntimeException {
    public PasswordValidateException(String message){
        super(message);
    }
}
