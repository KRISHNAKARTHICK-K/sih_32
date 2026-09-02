package com.agriprocure.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public class ManagerReportsResponse {

    private UUID centreId;
    private String centreName;
    private LocalDate fromDate;
    private LocalDate toDate;

    // Booking Summary
    private long totalBookings;
    private long confirmedBookings;
    private long completedBookings;
    private long cancelledBookings;

    // Procurement Summary
    private long totalProcurements;
    private BigDecimal totalQuantity;
    private BigDecimal totalGrossAmount;
    private BigDecimal totalDeductions;
    private BigDecimal totalNetAmount;

    // Crop Breakdown
    private List<CropProcurementSummaryDto> cropSummaries;

    // Quality Grade Breakdown
    private long gradeACount;
    private long gradeBCount;
    private long gradeCCount;
    private long rejectedCount;

    // Payment Summary
    private BigDecimal totalDisbursed;
    private BigDecimal pendingDisbursement;
    private long paidPaymentsCount;
    private long pendingPaymentsCount;

    // Daily Timeline Trends
    private List<DailyTrendDto> dailyTrends;

    public static class CropProcurementSummaryDto {
        private String cropName;
        private String cropUnit;
        private BigDecimal quantity;
        private BigDecimal totalValue;
        private long procurementCount;

        public CropProcurementSummaryDto() {}

        public CropProcurementSummaryDto(String cropName, String cropUnit, BigDecimal quantity,
                                        BigDecimal totalValue, long procurementCount) {
            this.cropName = cropName;
            this.cropUnit = cropUnit;
            this.quantity = quantity;
            this.totalValue = totalValue;
            this.procurementCount = procurementCount;
        }

        public String getCropName() { return cropName; }
        public void setCropName(String cropName) { this.cropName = cropName; }
        public String getCropUnit() { return cropUnit; }
        public void setCropUnit(String cropUnit) { this.cropUnit = cropUnit; }
        public BigDecimal getQuantity() { return quantity; }
        public void setQuantity(BigDecimal quantity) { this.quantity = quantity; }
        public BigDecimal getTotalValue() { return totalValue; }
        public void setTotalValue(BigDecimal totalValue) { this.totalValue = totalValue; }
        public long getProcurementCount() { return procurementCount; }
        public void setProcurementCount(long procurementCount) { this.procurementCount = procurementCount; }
    }

    public static class DailyTrendDto {
        private LocalDate date;
        private long bookingCount;
        private BigDecimal procurementQuantity;
        private BigDecimal procurementValue;

        public DailyTrendDto() {}

        public DailyTrendDto(LocalDate date, long bookingCount, BigDecimal procurementQuantity, BigDecimal procurementValue) {
            this.date = date;
            this.bookingCount = bookingCount;
            this.procurementQuantity = procurementQuantity;
            this.procurementValue = procurementValue;
        }

        public LocalDate getDate() { return date; }
        public void setDate(LocalDate date) { this.date = date; }
        public long getBookingCount() { return bookingCount; }
        public void setBookingCount(long bookingCount) { this.bookingCount = bookingCount; }
        public BigDecimal getProcurementQuantity() { return procurementQuantity; }
        public void setProcurementQuantity(BigDecimal procurementQuantity) { this.procurementQuantity = procurementQuantity; }
        public BigDecimal getProcurementValue() { return procurementValue; }
        public void setProcurementValue(BigDecimal procurementValue) { this.procurementValue = procurementValue; }
    }

    public ManagerReportsResponse() {
    }

    public UUID getCentreId() { return centreId; }
    public void setCentreId(UUID centreId) { this.centreId = centreId; }
    public String getCentreName() { return centreName; }
    public void setCentreName(String centreName) { this.centreName = centreName; }
    public LocalDate getFromDate() { return fromDate; }
    public void setFromDate(LocalDate fromDate) { this.fromDate = fromDate; }
    public LocalDate getToDate() { return toDate; }
    public void setToDate(LocalDate toDate) { this.toDate = toDate; }

    public long getTotalBookings() { return totalBookings; }
    public void setTotalBookings(long totalBookings) { this.totalBookings = totalBookings; }
    public long getConfirmedBookings() { return confirmedBookings; }
    public void setConfirmedBookings(long confirmedBookings) { this.confirmedBookings = confirmedBookings; }
    public long getCompletedBookings() { return completedBookings; }
    public void setCompletedBookings(long completedBookings) { this.completedBookings = completedBookings; }
    public long getCancelledBookings() { return cancelledBookings; }
    public void setCancelledBookings(long cancelledBookings) { this.cancelledBookings = cancelledBookings; }

    public long getTotalProcurements() { return totalProcurements; }
    public void setTotalProcurements(long totalProcurements) { this.totalProcurements = totalProcurements; }
    public BigDecimal getTotalQuantity() { return totalQuantity; }
    public void setTotalQuantity(BigDecimal totalQuantity) { this.totalQuantity = totalQuantity; }
    public BigDecimal getTotalGrossAmount() { return totalGrossAmount; }
    public void setTotalGrossAmount(BigDecimal totalGrossAmount) { this.totalGrossAmount = totalGrossAmount; }
    public BigDecimal getTotalDeductions() { return totalDeductions; }
    public void setTotalDeductions(BigDecimal totalDeductions) { this.totalDeductions = totalDeductions; }
    public BigDecimal getTotalNetAmount() { return totalNetAmount; }
    public void setTotalNetAmount(BigDecimal totalNetAmount) { this.totalNetAmount = totalNetAmount; }

    public List<CropProcurementSummaryDto> getCropSummaries() { return cropSummaries; }
    public void setCropSummaries(List<CropProcurementSummaryDto> cropSummaries) { this.cropSummaries = cropSummaries; }

    public long getGradeACount() { return gradeACount; }
    public void setGradeACount(long gradeACount) { this.gradeACount = gradeACount; }
    public long getGradeBCount() { return gradeBCount; }
    public void setGradeBCount(long gradeBCount) { this.gradeBCount = gradeBCount; }
    public long getGradeCCount() { return gradeCCount; }
    public void setGradeCCount(long gradeCCount) { this.gradeCCount = gradeCCount; }
    public long getRejectedCount() { return rejectedCount; }
    public void setRejectedCount(long rejectedCount) { this.rejectedCount = rejectedCount; }

    public BigDecimal getTotalDisbursed() { return totalDisbursed; }
    public void setTotalDisbursed(BigDecimal totalDisbursed) { this.totalDisbursed = totalDisbursed; }
    public BigDecimal getPendingDisbursement() { return pendingDisbursement; }
    public void setPendingDisbursement(BigDecimal pendingDisbursement) { this.pendingDisbursement = pendingDisbursement; }
    public long getPaidPaymentsCount() { return paidPaymentsCount; }
    public void setPaidPaymentsCount(long paidPaymentsCount) { this.paidPaymentsCount = paidPaymentsCount; }
    public long getPendingPaymentsCount() { return pendingPaymentsCount; }
    public void setPendingPaymentsCount(long pendingPaymentsCount) { this.pendingPaymentsCount = pendingPaymentsCount; }

    public List<DailyTrendDto> getDailyTrends() { return dailyTrends; }
    public void setDailyTrends(List<DailyTrendDto> dailyTrends) { this.dailyTrends = dailyTrends; }
}
