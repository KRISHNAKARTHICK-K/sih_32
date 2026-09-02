package com.agriprocure.dto;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

public class SlotCreateRequest {

    @NotNull(message = "Centre ID is required")
    private UUID centreId;

    @NotNull(message = "Slot date is required")
    @FutureOrPresent(message = "Slot date cannot be in the past")
    private LocalDate slotDate;

    @NotNull(message = "Start time is required")
    private LocalTime startTime;

    @NotNull(message = "End time is required")
    private LocalTime endTime;

    @NotNull(message = "Capacity is required")
    @Positive(message = "Capacity must be greater than zero")
    private Integer capacity;

    public SlotCreateRequest() {
    }

    public SlotCreateRequest(UUID centreId, LocalDate slotDate, LocalTime startTime, LocalTime endTime, Integer capacity) {
        this.centreId = centreId;
        this.slotDate = slotDate;
        this.startTime = startTime;
        this.endTime = endTime;
        this.capacity = capacity;
    }

    public UUID getCentreId() {
        return centreId;
    }

    public void setCentreId(UUID centreId) {
        this.centreId = centreId;
    }

    public LocalDate getSlotDate() {
        return slotDate;
    }

    public void setSlotDate(LocalDate slotDate) {
        this.slotDate = slotDate;
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalTime startTime) {
        this.startTime = startTime;
    }

    public LocalTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalTime endTime) {
        this.endTime = endTime;
    }

    public Integer getCapacity() {
        return capacity;
    }

    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }
}
