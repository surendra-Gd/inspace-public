package com.backend.demo.exception;

import lombok.Getter;

@Getter
public class AwsOperationException extends RuntimeException {
    private final String operationDetail;

    public AwsOperationException(String message, String operationDetail) {
        super(message);
        this.operationDetail = operationDetail;
    }
}
