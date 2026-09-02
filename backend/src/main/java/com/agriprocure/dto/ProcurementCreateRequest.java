package com.agriprocure.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.util.UUID;

public class ProcurementCreateRequest {

    @NotNull(message = "Farmer ID is required")
    private UUID farmerId;

    private UUID queueTokenId;

    @NotNull(message = "Crop ID is required")
    private UUID cropId;

    private BigDecimal declaredQuantity;

    @NotNull(message = "Actual quantity is required")
    @Positive(message = "Actual quantity must be positive")
    private BigDecimal actualQuantity;

    private BigDecimal ratePerUnit;

    private BigDecimal deductions;

    public ProcurementCreateRequest() {
    }

    public ProcurementCreateRequest(UUID farmerId, UUID queueTokenId, UUID cropId, BigDecimal declaredQuantity,
                                  BigDecimal actualQuantity, BigDecimal ratePerUnit, BigDecimal deductions) {
        this.farmerId = farmerId;
        this.queueTokenId = queueTokenId;
        this.cropId = cropId;
        this.declaredQuantity = declaredQuantity;
        this.actualQuantity = actualQuantity;
        this.ratePerUnit = ratePerUnit;
        this.deductions = deductions;
    }

    public UUID getFarmerId() {
        return farmerId;
    }

    public void setFarmerId(UUID farmerId) {
        this.farmerId = farmerId;
    }

    public UUID getQueueTokenId() {
        return queueTokenId;
    }

    public void setQueueTokenId(UUID queueTokenId) {
        this.queueTokenId = queueTokenId;
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

    public BigDecimal getActualQuantity() {
        return actualQuantity;
    }

    public void setActualQuantity(BigDecimal actualQuantity) {
        this.actualQuantity = actualQuantity;
    }

    public BigDecimal getRatePerUnit() {
        return ratePerUnit;
    }

    public void setRatePerUnit(BigDecimal ratePerUnit) {
        this.ratePerUnit = ratePerUnit;
    }

    public BigDecimal getDeductions() {
        return deductions;
    }

    public void setDeductions(BigDecimal deductions) {
        this.deductions = deductions;
    }
}
