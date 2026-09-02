package com.agriprocure.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.util.UUID;

public class BookingCreateRequest {

    @NotNull(message = "Farmer ID is required")
    private UUID farmerId;

    @NotNull(message = "Slot ID is required")
    private UUID slotId;

    @NotNull(message = "Crop ID is required")
    private UUID cropId;

    @NotNull(message = "Declared quantity is required")
    @Positive(message = "Declared quantity must be greater than zero")
    private BigDecimal declaredQuantity;

    public BookingCreateRequest() {
    }

    public BookingCreateRequest(UUID farmerId, UUID slotId, UUID cropId, BigDecimal declaredQuantity) {
        this.farmerId = farmerId;
        this.slotId = slotId;
        this.cropId = cropId;
        this.declaredQuantity = declaredQuantity;
    }

    public UUID getFarmerId() {
        return farmerId;
    }

    public void setFarmerId(UUID farmerId) {
        this.farmerId = farmerId;
    }

    public UUID getSlotId() {
        return slotId;
    }

    public void setSlotId(UUID slotId) {
        this.slotId = slotId;
    }

    public UUID getCropId() {
        return cropId;
    }

    public void setCropId(UUID cropId) {
        this.cropId = cropId;
    }

    public BigDecimal getDeclaredQuantity() {
        return declaredQuantity;
    }

    public void setDeclaredQuantity(BigDecimal declaredQuantity) {
        this.declaredQuantity = declaredQuantity;
    }
}
