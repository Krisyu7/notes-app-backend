package com.example.notes.exception;

public class NoteNotFoundException extends RuntimeException {
    public NoteNotFoundException(String message) {
        super(message);
    }
    
    public NoteNotFoundException(Long id) {
        super("Note with id " + id + " not found");
    }
}