package com.agriprocure.dto;

import com.agriprocure.entity.QualityGrade;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public class QualityInspectionResponse {

    private UUID id;
    private UUID procurementId;
    private QualityGrade grade;
    private BigDecimal moisturePercentage;
    private BigDecimal foreignMatterPercentage;
    private BigDecimal brokenGrainPercentage;
    private String inspectedBy;
    private Instant inspectedAt;
    private String remarks;
    private boolean approved;

    public QualityInspectionResponse() {
    }

    public QualityInspectionResponse(UUID id, UUID procurementId, QualityGrade grade, BigDecimal moisturePercentage,
                                   BigDecimal foreignMatterPercentage, BigDecimal brokenGrainPercentage,
                                   String inspectedBy, Instant inspectedAt, String remarks, boolean approved) {
        this.id = id;
        this.procurementId = procurementId;
        this.grade = grade;
        this.moisturePercentage = moisturePercentage;
        this.foreignMatterPercentage = foreignMatterPercentage;
        this.brokenGrainPercentage = brokenGrainPercentage;
        this.inspectedBy = inspectedBy;
        this.inspectedAt = inspectedAt;
        this.remarks = remarks;
        this.approved = approved;
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

    public QualityGrade getGrade() {
        return grade;
    }

    public void setGrade(QualityGrade grade) {
        this.grade = grade;
    }

    public BigDecimal getMoisturePercentage() {
        return moisturePercentage;
    }

    public void setMoisturePercentage(BigDecimal moisturePercentage) {
        this.moisturePercentage = moisturePercentage;
    }

    public BigDecimal getForeignMatterPercentage() {
        return foreignMatterPercentage;
    }

    public void setForeignMatterPercentage(BigDecimal foreignMatterPercentage) {
        this.foreignMatterPercentage = foreignMatterPercentage;
    }

    public BigDecimal getBrokenGrainPercentage() {
        return brokenGrainPercentage;
    }

    public void setBrokenGrainPercentage(BigDecimal brokenGrainPercentage) {
        this.brokenGrainPercentage = brokenGrainPercentage;
    }

    public String getInspectedBy() {
        return inspectedBy;
    }

    public void setInspectedBy(String inspectedBy) {
        this.inspectedBy = inspectedBy;
    }

    public Instant getInspectedAt() {
        return inspectedAt;
    }

    public void setInspectedAt(Instant inspectedAt) {
        this.inspectedAt = inspectedAt;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }

    public boolean isApproved() {
        return approved;
    }

    public void setApproved(boolean approved) {
        this.approved = approved;
    }
}
