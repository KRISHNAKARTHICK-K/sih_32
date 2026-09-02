package com.agriprocure.dto;

import com.agriprocure.entity.QualityGrade;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.UUID;

public class QualityInspectionRequest {

    private UUID procurementId;

    @NotNull(message = "Quality grade is required")
    private QualityGrade grade;

    private BigDecimal moisturePercentage;
    private BigDecimal foreignMatterPercentage;
    private BigDecimal brokenGrainPercentage;
    private String inspectedBy;
    private String remarks;
    private boolean approved = true;

    public QualityInspectionRequest() {
    }

    public QualityInspectionRequest(UUID procurementId, QualityGrade grade, BigDecimal moisturePercentage,
                                    BigDecimal foreignMatterPercentage, BigDecimal brokenGrainPercentage,
                                    String inspectedBy, String remarks, boolean approved) {
        this.procurementId = procurementId;
        this.grade = grade;
        this.moisturePercentage = moisturePercentage;
        this.foreignMatterPercentage = foreignMatterPercentage;
        this.brokenGrainPercentage = brokenGrainPercentage;
        this.inspectedBy = inspectedBy;
        this.remarks = remarks;
        this.approved = approved;
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
