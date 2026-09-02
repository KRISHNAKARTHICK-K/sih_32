package com.agriprocure.dto;

import java.math.BigDecimal;
import java.util.List;

public class AdminDashboardResponse {

    private long totalFarmers;
    private long activeCentres;
    private long todayBookings;
    private long activeQueueTokens;
    private BigDecimal totalProcurementQuantity;
    private BigDecimal totalProcurementValue;
    private long pendingPaymentsCount;
    private BigDecimal pendingPaymentsAmount;
    private long activeUsersCount;
    private List<AdminCentreSummaryResponse> centreSummaries;
    private List<AdminAuditLogResponse> recentActivity;

    public AdminDashboardResponse() {
    }

    public AdminDashboardResponse(long totalFarmers, long activeCentres, long todayBookings,
                                  long activeQueueTokens, BigDecimal totalProcurementQuantity,
                                  BigDecimal totalProcurementValue, long pendingPaymentsCount,
                                  BigDecimal pendingPaymentsAmount, long activeUsersCount,
                                  List<AdminCentreSummaryResponse> centreSummaries,
                                  List<AdminAuditLogResponse> recentActivity) {
        this.totalFarmers = totalFarmers;
        this.activeCentres = activeCentres;
        this.todayBookings = todayBookings;
        this.activeQueueTokens = activeQueueTokens;
        this.totalProcurementQuantity = totalProcurementQuantity;
        this.totalProcurementValue = totalProcurementValue;
        this.pendingPaymentsCount = pendingPaymentsCount;
        this.pendingPaymentsAmount = pendingPaymentsAmount;
        this.activeUsersCount = activeUsersCount;
        this.centreSummaries = centreSummaries;
        this.recentActivity = recentActivity;
    }

    public long getTotalFarmers() {
        return totalFarmers;
    }

    public void setTotalFarmers(long totalFarmers) {
        this.totalFarmers = totalFarmers;
    }

    public long getActiveCentres() {
        return activeCentres;
    }

    public void setActiveCentres(long activeCentres) {
        this.activeCentres = activeCentres;
    }

    public long getTodayBookings() {
        return todayBookings;
    }

    public void setTodayBookings(long todayBookings) {
        this.todayBookings = todayBookings;
    }

    public long getActiveQueueTokens() {
        return activeQueueTokens;
    }

    public void setActiveQueueTokens(long activeQueueTokens) {
        this.activeQueueTokens = activeQueueTokens;
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

    public long getActiveUsersCount() {
        return activeUsersCount;
    }

    public void setActiveUsersCount(long activeUsersCount) {
        this.activeUsersCount = activeUsersCount;
    }

    public List<AdminCentreSummaryResponse> getCentreSummaries() {
        return centreSummaries;
    }

    public void setCentreSummaries(List<AdminCentreSummaryResponse> centreSummaries) {
        this.centreSummaries = centreSummaries;
    }

    public List<AdminAuditLogResponse> getRecentActivity() {
        return recentActivity;
    }

    public void setRecentActivity(List<AdminAuditLogResponse> recentActivity) {
        this.recentActivity = recentActivity;
    }
}
