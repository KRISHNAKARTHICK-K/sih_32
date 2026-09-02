package com.agriprocure.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.util.UUID;

public class WeighmentRequest {

    private UUID procurementId;

    private BigDecimal declaredQuantity;

    @NotNull(message = "Actual weight is required")
    @Positive(message = "Actual weight must be greater than zero")
    private BigDecimal actualWeight;

    private BigDecimal moisturePercentage;
    private String recordedBy;
    private String remarks;

    public WeighmentRequest() {
    }

    public WeighmentRequest(UUID procurementId, BigDecimal declaredQuantity, BigDecimal actualWeight,
                            BigDecimal moisturePercentage, String recordedBy, String remarks) {
        this.procurementId = procurementId;
        this.declaredQuantity = declaredQuantity;
        this.actualWeight = actualWeight;
        this.moisturePercentage = moisturePercentage;
        this.recordedBy = recordedBy;
        this.remarks = remarks;
    }

    public UUID getProcurementId() {
        return procurementId;
    }

    public void setProcurementId(UUID procurementId) {
        this.procurementId = procurementId;
    }

    public BigDecimal getDeclaredQuantity() {
        return declaredQuantity;
    }

    public void setDeclaredQuantity(BigDecimal declaredQuantity) {
        this.declaredQuantity = declaredQuantity;
    }

    public BigDecimal getActualWeight() {
        return actualWeight;
    }

    public void setActualWeight(BigDecimal actualWeight) {
        this.actualWeight = actualWeight;
    }

    public BigDecimal getMoisturePercentage() {
        return moisturePercentage;
    }

    public void setMoisturePercentage(BigDecimal moisturePercentage) {
        this.moisturePercentage = moisturePercentage;
    }

    public String getRecordedBy() {
        return recordedBy;
    }

    public void setRecordedBy(String recordedBy) {
        this.recordedBy = recordedBy;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }
}
