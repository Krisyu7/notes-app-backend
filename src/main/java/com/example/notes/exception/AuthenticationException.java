package com.example.notes.exception;

public class AuthenticationException extends RuntimeException {
  public AuthenticationException(String message) {
    super(message);
  }

  public AuthenticationException() {
    super("Authentication failed");
  }
}