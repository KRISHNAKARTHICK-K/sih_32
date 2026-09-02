package com.agriprocure.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public class WeighmentResponse {

    private UUID id;
    private UUID procurementId;
    private BigDecimal declaredQuantity;
    private BigDecimal actualWeight;
    private BigDecimal moisturePercentage;
    private String recordedBy;
    private Instant recordedAt;
    private String remarks;

    public WeighmentResponse() {
    }

    public WeighmentResponse(UUID id, UUID procurementId, BigDecimal declaredQuantity, BigDecimal actualWeight,
                             BigDecimal moisturePercentage, String recordedBy, Instant recordedAt, String remarks) {
        this.id = id;
        this.procurementId = procurementId;
        this.declaredQuantity = declaredQuantity;
        this.actualWeight = actualWeight;
        this.moisturePercentage = moisturePercentage;
        this.recordedBy = recordedBy;
        this.recordedAt = recordedAt;
        this.remarks = remarks;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
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

    public Instant getRecordedAt() {
        return recordedAt;
    }

    public void setRecordedAt(Instant recordedAt) {
        this.recordedAt = recordedAt;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }
}
