package com.agriprocure.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public class CropPriceResponse {

    private UUID id;
    private UUID cropId;
    private String cropCode;
    private String cropName;
    private BigDecimal pricePerUnit;
    private LocalDate effectiveFrom;
    private LocalDate effectiveTo;
    private boolean active;
    private Instant createdAt;

    public CropPriceResponse() {
    }

    public CropPriceResponse(UUID id, UUID cropId, String cropCode, String cropName, BigDecimal pricePerUnit,
                             LocalDate effectiveFrom, LocalDate effectiveTo, boolean active, Instant createdAt) {
        this.id = id;
        this.cropId = cropId;
        this.cropCode = cropCode;
        this.cropName = cropName;
        this.pricePerUnit = pricePerUnit;
        this.effectiveFrom = effectiveFrom;
        this.effectiveTo = effectiveTo;
        this.active = active;
        this.createdAt = createdAt;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getCropId() {
        return cropId;
    }

    public void setCropId(UUID cropId) {
        this.cropId = cropId;
    }

    public String getCropCode() {
        return cropCode;
    }

    public void setCropCode(String cropCode) {
        this.cropCode = cropCode;
    }

    public String getCropName() {
        return cropName;
    }

    public void setCropName(String cropName) {
        this.cropName = cropName;
    }

    public BigDecimal getPricePerUnit() {
        return pricePerUnit;
    }

    public void setPricePerUnit(BigDecimal pricePerUnit) {
        this.pricePerUnit = pricePerUnit;
    }

    public LocalDate getEffectiveFrom() {
        return effectiveFrom;
    }

    public void setEffectiveFrom(LocalDate effectiveFrom) {
        this.effectiveFrom = effectiveFrom;
    }

    public LocalDate getEffectiveTo() {
        return effectiveTo;
    }

    public void setEffectiveTo(LocalDate effectiveTo) {
        this.effectiveTo = effectiveTo;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
