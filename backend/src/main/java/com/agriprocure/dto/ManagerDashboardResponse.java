package com.agriprocure.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public class ManagerDashboardResponse {

    private UUID centreId;
    private String centreName;
    private String centreCode;
    private LocalDate date;

    // Core KPIs
    private long todayBookingsCount;
    private long waitingTokensCount;
    private String currentlyServingToken;
    private long completedProcurementsCount;
    private BigDecimal totalProcurementQuantity;
    private BigDecimal totalProcurementValue;
    private long pendingPaymentsCount;
    private BigDecimal pendingPaymentsAmount;

    // Slot capacity & utilization
    private int totalSlotCapacity;
    private int bookedSlotCapacity;
    private double slotUtilizationPercentage;

    // Queue distribution
    private long waitingCount;
    private long verifiedCount;
    private long processingCount;
    private long qualityCheckCount;
    private long completedCount;
    private long cancelledCount;

    // Live Yard Lists
    private QueueTokenResponse currentlyServing;
    private List<QueueTokenResponse> upNextTokens;
    private List<OperationalAlertDto> operationalAlerts;

    public ManagerDashboardResponse() {
    }

    public UUID getCentreId() {
        return centreId;
    }

    public void setCentreId(UUID centreId) {
        this.centreId = centreId;
    }

    public String getCentreName() {
        return centreName;
    }

    public void setCentreName(String centreName) {
        this.centreName = centreName;
    }

    public String getCentreCode() {
        return centreCode;
    }

    public void setCentreCode(String centreCode) {
        this.centreCode = centreCode;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public long getTodayBookingsCount() {
        return todayBookingsCount;
    }

    public void setTodayBookingsCount(long todayBookingsCount) {
        this.todayBookingsCount = todayBookingsCount;
    }

    public long getWaitingTokensCount() {
        return waitingTokensCount;
    }

    public void setWaitingTokensCount(long waitingTokensCount) {
        this.waitingTokensCount = waitingTokensCount;
    }

    public String getCurrentlyServingToken() {
        return currentlyServingToken;
    }

    public void setCurrentlyServingToken(String currentlyServingToken) {
        this.currentlyServingToken = currentlyServingToken;
    }

    public long getCompletedProcurementsCount() {
        return completedProcurementsCount;
    }

    public void setCompletedProcurementsCount(long completedProcurementsCount) {
        this.completedProcurementsCount = completedProcurementsCount;
    }

    public BigDecimal getTotalProcurementQuantity() {
        return totalProcurementQuantity;
    }

    public void setTotalProcurementQuantity(BigDecimal totalProcurementQuantity) {
        this.totalProcurementQuantity = totalProcurementQuantity;
    }

    public BigDecimal getTotalProcurementValue() {
        return totalProcurementValue;
    }

    public void setTotalProcurementValue(BigDecimal totalProcurementValue) {
        this.totalProcurementValue = totalProcurementValue;
    }

    public long getPendingPaymentsCount() {
        return pendingPaymentsCount;
    }

    public void setPendingPaymentsCount(long pendingPaymentsCount) {
        this.pendingPaymentsCount = pendingPaymentsCount;
    }

    public BigDecimal getPendingPaymentsAmount() {
        return pendingPaymentsAmount;
    }

    public void setPendingPaymentsAmount(BigDecimal pendingPaymentsAmount) {
        this.pendingPaymentsAmount = pendingPaymentsAmount;
    }

    public int getTotalSlotCapacity() {
        return totalSlotCapacity;
    }

    public void setTotalSlotCapacity(int totalSlotCapacity) {
        this.totalSlotCapacity = totalSlotCapacity;
    }

    public int getBookedSlotCapacity() {
        return bookedSlotCapacity;
    }

    public void setBookedSlotCapacity(int bookedSlotCapacity) {
        this.bookedSlotCapacity = bookedSlotCapacity;
    }

    public double getSlotUtilizationPercentage() {
        return slotUtilizationPercentage;
    }

    public void setSlotUtilizationPercentage(double slotUtilizationPercentage) {
        this.slotUtilizationPercentage = slotUtilizationPercentage;
    }

    public long getWaitingCount() {
        return waitingCount;
    }

    public void setWaitingCount(long waitingCount) {
        this.waitingCount = waitingCount;
    }

    public long getVerifiedCount() {
        return verifiedCount;
    }

    public void setVerifiedCount(long verifiedCount) {
        this.verifiedCount = verifiedCount;
    }

    public long getProcessingCount() {
        return processingCount;
    }

    public void setProcessingCount(long processingCount) {
        this.processingCount = processingCount;
    }

    public long getQualityCheckCount() {
        return qualityCheckCount;
    }

    public void setQualityCheckCount(long qualityCheckCount) {
        this.qualityCheckCount = qualityCheckCount;
    }

    public long getCompletedCount() {
        return completedCount;
    }

    public void setCompletedCount(long completedCount) {
        this.completedCount = completedCount;
    }

    public long getCancelledCount() {
        return cancelledCount;
    }

    public void setCancelledCount(long cancelledCount) {
        this.cancelledCount = cancelledCount;
    }

    public QueueTokenResponse getCurrentlyServing() {
        return currentlyServing;
    }

    public void setCurrentlyServing(QueueTokenResponse currentlyServing) {
        this.currentlyServing = currentlyServing;
    }

    public List<QueueTokenResponse> getUpNextTokens() {
        return upNextTokens;
    }

    public void setUpNextTokens(List<QueueTokenResponse> upNextTokens) {
        this.upNextTokens = upNextTokens;
    }

    public List<OperationalAlertDto> getOperationalAlerts() {
        return operationalAlerts;
    }

    public void setOperationalAlerts(List<OperationalAlertDto> operationalAlerts) {
        this.operationalAlerts = operationalAlerts;
    }
}
