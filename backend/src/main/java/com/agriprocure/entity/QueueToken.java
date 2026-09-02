package com.agriprocure.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "queue_tokens", indexes = {
    @Index(name = "idx_token_centre_date", columnList = "centre_id, queueDate"),
    @Index(name = "idx_token_display", columnList = "displayToken"),
    @Index(name = "idx_token_status", columnList = "status"),
    @Index(name = "idx_token_farmer", columnList = "farmer_id")
})
public class QueueToken {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private Integer tokenNumber;

    @Column(nullable = false, length = 50)
    private String displayToken;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "farmer_id", nullable = false)
    private Farmer farmer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "centre_id", nullable = false)
    private ProcurementCentre centre;

    @Column(nullable = false)
    private LocalDate queueDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private QueueStatus status = QueueStatus.BOOKED;

    private Integer queuePosition;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    public QueueToken() {
    }

    public QueueToken(Integer tokenNumber, String displayToken, Booking booking, Farmer farmer,
                      ProcurementCentre centre, LocalDate queueDate, QueueStatus status, Integer queuePosition) {
        this.tokenNumber = tokenNumber;
        this.displayToken = displayToken;
        this.booking = booking;
        this.farmer = farmer;
        this.centre = centre;
        this.queueDate = queueDate;
        this.status = status;
        this.queuePosition = queuePosition;
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

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public Integer getTokenNumber() {
        return tokenNumber;
    }

    public void setTokenNumber(Integer tokenNumber) {
        this.tokenNumber = tokenNumber;
    }

    public String getDisplayToken() {
        return displayToken;
    }

    public void setDisplayToken(String displayToken) {
        this.displayToken = displayToken;
    }

    public Booking getBooking() {
        return booking;
    }

    public void setBooking(Booking booking) {
        this.booking = booking;
    }

    public Farmer getFarmer() {
        return farmer;
    }

    public void setFarmer(Farmer farmer) {
        this.farmer = farmer;
    }

    public ProcurementCentre getCentre() {
        return centre;
    }

    public void setCentre(ProcurementCentre centre) {
        this.centre = centre;
    }

    public LocalDate getQueueDate() {
        return queueDate;
    }

    public void setQueueDate(LocalDate queueDate) {
        this.queueDate = queueDate;
    }

    public QueueStatus getStatus() {
        return status;
    }

    public void setStatus(QueueStatus status) {
        this.status = status;
    }

    public Integer getQueuePosition() {
        return queuePosition;
    }

    public void setQueuePosition(Integer queuePosition) {
        this.queuePosition = queuePosition;
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
}
