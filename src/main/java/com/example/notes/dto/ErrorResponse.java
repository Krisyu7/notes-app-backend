package com.example.notes.dto;

import java.time.LocalDateTime;
import java.util.Map;

public class ErrorResponse {
    private String error;
    private String message;
    private LocalDateTime timestamp;
    private Map<String, String> details;

    public ErrorResponse() {}

    public ErrorResponse(String error, String message, LocalDateTime timestamp, Map<String, String> details) {
        this.error = error;
        this.message = message;
        this.timestamp = timestamp;
        this.details = details;
    }

    // Static factory methods for common errors
    public static ErrorResponse of(String error, String message) {
        return new ErrorResponse(error, message, LocalDateTime.now(), null);
    }

    public static ErrorResponse validation(String message, Map<String, String> details) {
        return new ErrorResponse("Validation Error", message, LocalDateTime.now(), details);
    }

    public static ErrorResponse notFound(String message) {
        return new ErrorResponse("Not Found", message, LocalDateTime.now(), null);
    }

    public static ErrorResponse internal(String message) {
        return new ErrorResponse("Internal Server Error", message, LocalDateTime.now(), null);
    }

    // 新增的静态方法
    public static ErrorResponse unauthorized(String message) {
        return new ErrorResponse("Unauthorized", message, LocalDateTime.now(), null);
    }

    public static ErrorResponse conflict(String message) {
        return new ErrorResponse("Conflict", message, LocalDateTime.now(), null);
    }

    public static ErrorResponse badRequest(String message) {
        return new ErrorResponse("Bad Request", message, LocalDateTime.now(), null);
    }

    public static ErrorResponse forbidden(String message) {
        return new ErrorResponse("Forbidden", message, LocalDateTime.now(), null);
    }

    // Getters and setters
    public String getError() { return error; }
    public void setError(String error) { this.error = error; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    public Map<String, String> getDetails() { return details; }
    public void setDetails(Map<String, String> details) { this.details = details; }
}