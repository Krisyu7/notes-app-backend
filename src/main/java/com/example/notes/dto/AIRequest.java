package com.example.notes.dto;

public class AIRequest {
    private String question;
    private String noteContent;

    public AIRequest() {}

    public String getQuestion() { return question; }
    public void setQuestion(String question) { this.question = question; }

    public String getNoteContent() { return noteContent; }
    public void setNoteContent(String noteContent) { this.noteContent = noteContent; }
}