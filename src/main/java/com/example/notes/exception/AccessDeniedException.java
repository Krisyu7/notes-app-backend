package com.example.notes.exception;

public class AccessDeniedException extends RuntimeException {
    public AccessDeniedException(String message) {
        super("AccessDenied");
    }
}
