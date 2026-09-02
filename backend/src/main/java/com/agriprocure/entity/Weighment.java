package com.agriprocure.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "weighments", indexes = {
    @Index(name = "idx_weighment_proc", columnList = "procurement_id")
})
public class Weighment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "procurement_id", nullable = false)
    private Procurement procurement;

    @Column(precision = 10, scale = 2)
    private BigDecimal declaredQuantity;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal actualWeight;

    @Column(precision = 5, scale = 2)
    private BigDecimal moisturePercentage;

    @Column(length = 100)
    private String recordedBy;

    @Column(nullable = false)
    private Instant recordedAt;

    @Column(length = 255)
    private String remarks;

    public Weighment() {
    }

    public Weighment(Procurement procurement, BigDecimal declaredQuantity, BigDecimal actualWeight,
                     BigDecimal moisturePercentage, String recordedBy, String remarks) {
        this.procurement = procurement;
        this.declaredQuantity = declaredQuantity;
        this.actualWeight = actualWeight;
        this.moisturePercentage = moisturePercentage;
        this.recordedBy = recordedBy;
        this.recordedAt = Instant.now();
        this.remarks = remarks;
    }

    @PrePersist
    protected void onCreate() {
        if (this.recordedAt == null) {
            this.recordedAt = Instant.now();
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
