package com.agriprocure.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "quality_inspections", indexes = {
    @Index(name = "idx_inspect_proc", columnList = "procurement_id"),
    @Index(name = "idx_inspect_grade", columnList = "grade")
})
public class QualityInspection {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "procurement_id", nullable = false)
    private Procurement procurement;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private QualityGrade grade = QualityGrade.A;

    @Column(precision = 5, scale = 2)
    private BigDecimal moisturePercentage;

    @Column(precision = 5, scale = 2)
    private BigDecimal foreignMatterPercentage;

    @Column(precision = 5, scale = 2)
    private BigDecimal brokenGrainPercentage;

    @Column(length = 100)
    private String inspectedBy;

    @Column(nullable = false)
    private Instant inspectedAt;

    @Column(length = 255)
    private String remarks;

    @Column(nullable = false)
    private boolean approved = true;

    public QualityInspection() {
    }

    public QualityInspection(Procurement procurement, QualityGrade grade, BigDecimal moisturePercentage,
                             BigDecimal foreignMatterPercentage, BigDecimal brokenGrainPercentage,
                             String inspectedBy, String remarks, boolean approved) {
        this.procurement = procurement;
        this.grade = grade;
        this.moisturePercentage = moisturePercentage;
        this.foreignMatterPercentage = foreignMatterPercentage;
        this.brokenGrainPercentage = brokenGrainPercentage;
        this.inspectedBy = inspectedBy;
        this.inspectedAt = Instant.now();
        this.remarks = remarks;
        this.approved = approved;
    }

    @PrePersist
    protected void onCreate() {
        if (this.inspectedAt == null) {
            this.inspectedAt = Instant.now();
        }
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public Procurement getProcurement() {
        return procurement;
    }

    public void setProcurement(Procurement procurement) {
        this.procurement = procurement;
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
