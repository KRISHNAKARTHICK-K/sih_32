package com.agriprocure.dto;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public class QueueOverviewResponse {

    private UUID centreId;
    private String centreName;
    private LocalDate queueDate;
    private String currentServingToken;
    private long totalTokens;
    private long waitingCount;
    private long processingCount;
    private long completedCount;
    private List<QueueTokenResponse> activeTokens;

    public QueueOverviewResponse() {
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

    public LocalDate getQueueDate() {
        return queueDate;
    }

    public void setQueueDate(LocalDate queueDate) {
        this.queueDate = queueDate;
    }

    public String getCurrentServingToken() {
        return currentServingToken;
    }

    public void setCurrentServingToken(String currentServingToken) {
        this.currentServingToken = currentServingToken;
    }

    public long getTotalTokens() {
        return totalTokens;
    }

    public void setTotalTokens(long totalTokens) {
        this.totalTokens = totalTokens;
    }

    public long getWaitingCount() {
        return waitingCount;
    }

    public void setWaitingCount(long waitingCount) {
        this.waitingCount = waitingCount;
    }

    public long getProcessingCount() {
        return processingCount;
    }

    public void setProcessingCount(long processingCount) {
        this.processingCount = processingCount;
    }

    public long getCompletedCount() {
        return completedCount;
    }

    public void setCompletedCount(long completedCount) {
        this.completedCount = completedCount;
    }

    public List<QueueTokenResponse> getActiveTokens() {
        return activeTokens;
    }

    public void setActiveTokens(List<QueueTokenResponse> activeTokens) {
        this.activeTokens = activeTokens;
    }
}
