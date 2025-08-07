package com.example.notes.dto;

public class AIResponse {
    private String response;
    private boolean success;
    private String error;

    public AIResponse() {}

    public AIResponse(String response) {
        this.response = response;
        this.success = true;
    }

    public AIResponse(String error, boolean success) {
        this.error = error;
        this.success = success;
    }

    // Getters and setters
    public String getResponse() { return response; }
    public void setResponse(String response) { this.response = response; }

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }

    public String getError() { return error; }
    public void setError(String error) { this.error = error; }
}
