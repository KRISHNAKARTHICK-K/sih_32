package com.agriprocure.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "procurements", indexes = {
    @Index(name = "idx_proc_code", columnList = "procurementCode", unique = true),
    @Index(name = "idx_proc_farmer", columnList = "farmer_id"),
    @Index(name = "idx_proc_token", columnList = "queue_token_id"),
    @Index(name = "idx_proc_status", columnList = "status")
})
public class Procurement {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true, length = 50)
    private String procurementCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "farmer_id", nullable = false)
    private Farmer farmer;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "queue_token_id")
    private QueueToken queueToken;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "crop_id", nullable = false)
    private Crop crop;

    @Column(precision = 10, scale = 2)
    private BigDecimal declaredQuantity;

    @Column(precision = 10, scale = 2)
    private BigDecimal actualQuantity;

    @Column(precision = 12, scale = 2)
    private BigDecimal ratePerUnit;

    @Column(precision = 14, scale = 2)
    private BigDecimal grossAmount;

    @Column(precision = 14, scale = 2)
    private BigDecimal deductions = BigDecimal.ZERO;

    @Column(precision = 14, scale = 2)
    private BigDecimal netAmount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ProcurementStatus status = ProcurementStatus.DRAFT;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    private Instant completedAt;

    public Procurement() {
    }

    public Procurement(String procurementCode, Farmer farmer, QueueToken queueToken, Crop crop,
                       BigDecimal declaredQuantity, BigDecimal actualQuantity, BigDecimal ratePerUnit,
                       BigDecimal grossAmount, BigDecimal deductions, BigDecimal netAmount, ProcurementStatus status) {
        this.procurementCode = procurementCode;
        this.farmer = farmer;
        this.queueToken = queueToken;
        this.crop = crop;
        this.declaredQuantity = declaredQuantity;
        this.actualQuantity = actualQuantity;
        this.ratePerUnit = ratePerUnit;
        this.grossAmount = grossAmount;
        this.deductions = deductions != null ? deductions : BigDecimal.ZERO;
        this.netAmount = netAmount;
        this.status = status;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }

    public void calculateFinancials() {
        if (actualQuantity != null && ratePerUnit != null) {
            this.grossAmount = actualQuantity.multiply(ratePerUnit);
            BigDecimal currentDeductions = this.deductions != null ? this.deductions : BigDecimal.ZERO;
            this.netAmount = this.grossAmount.subtract(currentDeductions);
        }
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

    public Farmer getFarmer() {
        return farmer;
    }

    public void setFarmer(Farmer farmer) {
        this.farmer = farmer;
    }

    public QueueToken getQueueToken() {
        return queueToken;
    }

    public void setQueueToken(QueueToken queueToken) {
        this.queueToken = queueToken;
    }

    public Crop getCrop() {
        return crop;
    }

    public void setCrop(Crop crop) {
        this.crop = crop;
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

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Instant getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(Instant completedAt) {
        this.completedAt = completedAt;
    }
}
