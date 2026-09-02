package com.agriprocure.dto;

import com.agriprocure.entity.ProcurementStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public class ProcurementResponse {

    private UUID id;
    private String procurementCode;
    private UUID farmerId;
    private String farmerName;
    private String farmerCode;
    private UUID queueTokenId;
    private String displayToken;
    private UUID cropId;
    private String cropName;
    private String cropUnit;
    private BigDecimal declaredQuantity;
    private BigDecimal actualQuantity;
    private BigDecimal ratePerUnit;
    private BigDecimal grossAmount;
    private BigDecimal deductions;
    private BigDecimal netAmount;
    private ProcurementStatus status;
    private Instant createdAt;
    private Instant completedAt;
    private WeighmentResponse weighment;
    private QualityInspectionResponse qualityInspection;

    public ProcurementResponse() {
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getProcurementCode() {
        return procurementCode;
    }

    public void setProcurementCode(String procurementCode) {
        this.procurementCode = procurementCode;
    }

    public UUID getFarmerId() {
        return farmerId;
    }

    public void setFarmerId(UUID farmerId) {
        this.farmerId = farmerId;
    }

    public String getFarmerName() {
        return farmerName;
    }

    public void setFarmerName(String farmerName) {
        this.farmerName = farmerName;
    }

    public String getFarmerCode() {
        return farmerCode;
    }

    public void setFarmerCode(String farmerCode) {
        this.farmerCode = farmerCode;
    }

    public UUID getQueueTokenId() {
        return queueTokenId;
    }

    public void setQueueTokenId(UUID queueTokenId) {
        this.queueTokenId = queueTokenId;
    }

    public String getDisplayToken() {
        return displayToken;
    }

    public void setDisplayToken(String displayToken) {
        this.displayToken = displayToken;
    }

    public UUID getCropId() {
        return cropId;
    }

    public void setCropId(UUID cropId) {
        this.cropId = cropId;
    }

    public String getCropName() {
        return cropName;
    }

    public void setCropName(String cropName) {
        this.cropName = cropName;
    }

    public String getCropUnit() {
        return cropUnit;
    }

    public void setCropUnit(String cropUnit) {
        this.cropUnit = cropUnit;
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

    public BigDecimal getGrossAmount() {
        return grossAmount;
    }

    public void setGrossAmount(BigDecimal grossAmount) {
        this.grossAmount = grossAmount;
    }

    public BigDecimal getDeductions() {
        return deductions;
    }

    public void setDeductions(BigDecimal deductions) {
        this.deductions = deductions;
    }

    public BigDecimal getNetAmount() {
        return netAmount;
    }

    public void setNetAmount(BigDecimal netAmount) {
        this.netAmount = netAmount;
    }

    public ProcurementStatus getStatus() {
        return status;
    }

    public void setStatus(ProcurementStatus status) {
        this.status = status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(Instant completedAt) {
        this.completedAt = completedAt;
    }

    public WeighmentResponse getWeighment() {
        return weighment;
    }

    public void setWeighment(WeighmentResponse weighment) {
        this.weighment = weighment;
    }

    public QualityInspectionResponse getQualityInspection() {
        return qualityInspection;
    }

    public void setQualityInspection(QualityInspectionResponse qualityInspection) {
        this.qualityInspection = qualityInspection;
    }
}
