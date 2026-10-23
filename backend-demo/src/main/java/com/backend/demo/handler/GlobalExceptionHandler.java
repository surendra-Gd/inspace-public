package com.backend.demo.handler;


import com.backend.demo.exception.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.Marker;
import org.slf4j.MarkerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;



import java.util.HashSet;
import java.util.Set;


import static org.springframework.http.HttpStatus.*;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    private static final Marker DB_CRITICAL = MarkerFactory.getMarker("DB_CRITICAL");
    private static final Marker AUTHORIZATION_ERROR = MarkerFactory.getMarker("AUTHORIZATION_ERROR");
    private static final Marker COMMON_ERROR = MarkerFactory.getMarker("COMMON_ERROR");
    private static final Marker AWS_ERROR = MarkerFactory.getMarker("AWS_ERROR");


    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleException(Exception ex) {
        logger.error(COMMON_ERROR, "Error on Exception.class: {}", ex.getMessage(), ex);
        System.out.println(ex.getMessage());
        var res = ErrorResponse.builder()
                .status(INTERNAL_SERVER_ERROR.value())
                .error("Internal Server Error")
                .message("Something went wrong on server. Please try again later")
                .build();

        return ResponseEntity.status(INTERNAL_SERVER_ERROR).body(res);
    }



    @ExceptionHandler(EmailSendingException.class)
    public ResponseEntity<ErrorResponse> handleException(
            EmailSendingException ex
    ) {
        logger.error(COMMON_ERROR, "Error on EmailSendingException.class: {}", ex.getMessage(), ex);
        var res = ErrorResponse.builder()
                .status(INTERNAL_SERVER_ERROR.value())
                .error("Messaging Error")
                .message(ex.getMessage())
                .build();

        return ResponseEntity.status(INTERNAL_SERVER_ERROR).body(res);
    }


    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleException(
            BadCredentialsException ex
    ) {
        var res = ErrorResponse.builder()
                .status(UNAUTHORIZED.value())
                .error(ex.getMessage())
                .message("Username or password are Invalid.")
                .build();

        return ResponseEntity.status(UNAUTHORIZED).body(res);
    }


    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ValidationErrorResponse> handleException(
            MethodArgumentNotValidException exp
    ) {
        Set<String> errors = new HashSet<>();
        exp.getBindingResult().getAllErrors()
                .forEach(error -> {
                    var errorMessage = error.getDefaultMessage();
                    errors.add(errorMessage);
                });
        ValidationErrorResponse res = ValidationErrorResponse.builder()
                .status(BAD_REQUEST.value())
                .error("Validation failed")
                .validationErrors(errors)
                .build();

        return ResponseEntity.status(BAD_REQUEST).body(res);
    }


    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleException(
            ResourceNotFoundException ex
    ) {
        var res = ErrorResponse.builder()
                .status(NOT_FOUND.value())
                .error("Resource not found")
                .message(ex.getMessage())
                .build();

        return ResponseEntity.status(NOT_FOUND).body(res);
    }



    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleException(
             InvalidCredentialsException ex
    ) {
        var res = ErrorResponse.builder()
                .status(BAD_REQUEST.value())
                .error("Invalid Credentials")
                .message(ex.getMessage())
                .build();

        return ResponseEntity.status(BAD_REQUEST).body(res);
    }


    @ExceptionHandler(ResourceFoundException.class)
    public ResponseEntity<ErrorResponse> handleException(
            ResourceFoundException ex
    ) {
        var res = ErrorResponse.builder()
                .status(CONFLICT.value())
                .error("Resource Found")
                .message(ex.getMessage())
                .build();

        return ResponseEntity.status(CONFLICT).body(res);
    }


    @ExceptionHandler(OperationNotPermittedException.class)
    public ResponseEntity<ErrorResponse> handleException(
            OperationNotPermittedException ex
    ) {

        logger.error(COMMON_ERROR, "Error on OperationNotPermittedException.class: {}", ex.getMessage(), ex);
        var res = ErrorResponse.builder()
                .status(BAD_REQUEST.value())
                .error("Unauthorized Access")
                .message(ex.getMessage())
                .build();

        return ResponseEntity.status(BAD_REQUEST).body(res);
    }

    @ExceptionHandler(PasswordValidateException.class)
    public ResponseEntity<ErrorResponse> handleException(
            PasswordValidateException ex
    ) {
        var res = ErrorResponse.builder()
                .status(BAD_REQUEST.value())
                .error("Password Validation Error")
                .message(ex.getMessage())
                .build();

        return ResponseEntity.status(BAD_REQUEST).body(res);
    }

    @ExceptionHandler(OperationFailedException.class)
    public ResponseEntity<ErrorResponse> handleException(
            OperationFailedException ex
    ) {
        logger.error(COMMON_ERROR, "Error on OperationFailedException.class: {}", ex.getMessage(), ex);
        var res = ErrorResponse.builder()
                .status(BAD_REQUEST.value())
                .error("Operation Failed")
                .message(ex.getMessage())
                .build();

        return ResponseEntity.status(BAD_REQUEST).body(res);
    }

    @ExceptionHandler({LockedException.class, DisabledException.class})
    public ResponseEntity<ErrorResponse> handleException() {
        var response = ErrorResponse.builder()
                .status(FORBIDDEN.value())
                .error("Account Disabled")
                .message("Email is not verified. please verify your email by clicking forget password.")
                .build();

        return ResponseEntity.status(FORBIDDEN).body(response);
    }


    @ExceptionHandler(IncomingRequestFoundException.class)
    public ResponseEntity<ErrorResponse> handleException(
            IncomingRequestFoundException ex
    ) {
        var response = ErrorResponse.builder()
                .status(409)
                .error(ex.getError())
                .message(ex.getMessage())
                .response(ex.getRequestId())
                .build();

        return ResponseEntity.status(CONFLICT).body(response);
    }

    @ExceptionHandler(EntityFoundException.class)
    public ResponseEntity<ErrorResponse> handleException(
            EntityFoundException ex
    ) {
        var response = ErrorResponse.builder()
                .status(302)
                .error(ex.getError())
                .message(ex.getMessage())
                .response(ex.getEntityId())
                .build();

        return ResponseEntity.status(FOUND).body(response);
    }

    @ExceptionHandler(EmojiFoundException.class)
    public ResponseEntity<ErrorResponse> handleException(
            EmojiFoundException ex
    ) {
        var response = ErrorResponse.builder()
                .status(302)
                .error(ex.getError())
                .message(ex.getMessage())
                .response(ex.getPayload())
                .build();

        return ResponseEntity.status(FOUND).body(response);
    }


    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleException(
            AccessDeniedException ex
    ) {
        logger.error(AUTHORIZATION_ERROR, "Authorization Error: {}", ex.getMessage(), ex);
        var response = ErrorResponse.builder()
                .status(403)
                .error("UnAuthorized Access")
                .message(ex.getMessage())
                .build();

        return ResponseEntity.status(FORBIDDEN).body(response);
    }

    @ExceptionHandler(DatabaseOperationException.class)
    public ResponseEntity<ErrorResponse> handleDatabaseException(
            DatabaseOperationException ex
    ) {

        logger.error(DB_CRITICAL, "Critical DB Error: {} | {}", ex.getMessage(), ex.getOperationDetail(), ex);

        var response = ErrorResponse.builder()
                .status(500)
                .error("Internal Server error")
                .message("Something went wrong. Please try again after sometime.")
                .build();

        return ResponseEntity.status(INTERNAL_SERVER_ERROR).body(response);
    }

    @ExceptionHandler(AwsOperationException.class)
    public ResponseEntity<ErrorResponse> handleAwsException(
            AwsOperationException ex
    ) {


        logger.error(AWS_ERROR, "Critical AWS Error: {} | {}", ex.getMessage(), ex.getOperationDetail(), ex);
        var response = ErrorResponse.builder()
                .status(500)
                .error("Internal Server error")
                .message("Something went wrong. Please try again after sometime.")
                .build();

        return ResponseEntity.status(INTERNAL_SERVER_ERROR).body(response);
    }


}