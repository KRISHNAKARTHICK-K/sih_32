package com.agriprocure.dto;

import java.math.BigDecimal;
import java.util.UUID;

public class AdminCentreSummaryResponse {

    private UUID centreId;
    private String centreCode;
    private String centreName;
    private String district;
    private String state;
    private boolean active;
    private int staffCount;
    private int todayBookings;
    private int waitingTokens;
    private String currentlyServing;
    private BigDecimal procurementQuantity;
    private BigDecimal procurementValue;
    private BigDecimal pendingPayments;
    private double slotUtilization;

    public AdminCentreSummaryResponse() {
    }

    public AdminCentreSummaryResponse(UUID centreId, String centreCode, String centreName, String district,
                                      String state, boolean active, int staffCount, int todayBookings,
                                      int waitingTokens, String currentlyServing, BigDecimal procurementQuantity,
                                      BigDecimal procurementValue, BigDecimal pendingPayments, double slotUtilization) {
        this.centreId = centreId;
        this.centreCode = centreCode;
        this.centreName = centreName;
        this.district = district;
        this.state = state;
        this.active = active;
        this.staffCount = staffCount;
        this.todayBookings = todayBookings;
        this.waitingTokens = waitingTokens;
        this.currentlyServing = currentlyServing;
        this.procurementQuantity = procurementQuantity;
        this.procurementValue = procurementValue;
        this.pendingPayments = pendingPayments;
        this.slotUtilization = slotUtilization;
    }

    public UUID getCentreId() {
        return centreId;
    }

    public void setCentreId(UUID centreId) {
        this.centreId = centreId;
    }

    public String getCentreCode() {
        return centreCode;
    }

    public void setCentreCode(String centreCode) {
        this.centreCode = centreCode;
    }

    public String getCentreName() {
        return centreName;
    }

    public void setCentreName(String centreName) {
        this.centreName = centreName;
    }

    public String getDistrict() {
        return district;
    }

    public void setDistrict(String district) {
        this.district = district;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public int getStaffCount() {
        return staffCount;
    }

    public void setStaffCount(int staffCount) {
        this.staffCount = staffCount;
    }

    public int getTodayBookings() {
        return todayBookings;
    }

    public void setTodayBookings(int todayBookings) {
        this.todayBookings = todayBookings;
    }

    public int getWaitingTokens() {
        return waitingTokens;
    }

    public void setWaitingTokens(int waitingTokens) {
        this.waitingTokens = waitingTokens;
    }

    public String getCurrentlyServing() {
        return currentlyServing;
    }

    public void setCurrentlyServing(String currentlyServing) {
        this.currentlyServing = currentlyServing;
    }

    public BigDecimal getProcurementQuantity() {
        return procurementQuantity;
    }

    public void setProcurementQuantity(BigDecimal procurementQuantity) {
        this.procurementQuantity = procurementQuantity;
    }

    public BigDecimal getProcurementValue() {
        return procurementValue;
    }

    public void setProcurementValue(BigDecimal procurementValue) {
        this.procurementValue = procurementValue;
    }

    public BigDecimal getPendingPayments() {
        return pendingPayments;
    }

    public void setPendingPayments(BigDecimal pendingPayments) {
        this.pendingPayments = pendingPayments;
    }

    public double getSlotUtilization() {
        return slotUtilization;
    }

    public void setSlotUtilization(double slotUtilization) {
        this.slotUtilization = slotUtilization;
    }
}
