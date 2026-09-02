package com.agriprocure.dto;

public class OperationalAlertDto {

    private String level; // INFO, WARNING, CRITICAL
    private String title;
    private String message;
    private String category; // QUEUE, SLOTS, WEIGHMENT, QUALITY, PAYMENT

    public OperationalAlertDto() {
    }

    public OperationalAlertDto(String level, String title, String message, String category) {
        this.level = level;
        this.title = title;
        this.message = message;
        this.category = category;
    }

    public String getLevel() {
        return level;
    }

    public void setLevel(String level) {
        this.level = level;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }
}
