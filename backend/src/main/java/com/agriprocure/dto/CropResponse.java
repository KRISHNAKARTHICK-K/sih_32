package com.agriprocure.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public class CropResponse {

    private UUID id;
    private String code;
    private String name;
    private String unit;
    private BigDecimal currentPrice;
    private boolean active;
    private Instant createdAt;

    public CropResponse() {
    }

    public CropResponse(UUID id, String code, String name, String unit, BigDecimal currentPrice, boolean active, Instant createdAt) {
        this.id = id;
        this.code = code;
        this.name = name;
        this.unit = unit;
        this.currentPrice = currentPrice;
        this.active = active;
        this.createdAt = createdAt;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public BigDecimal getCurrentPrice() {
        return currentPrice;
    }

    public void setCurrentPrice(BigDecimal currentPrice) {
        this.currentPrice = currentPrice;
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
