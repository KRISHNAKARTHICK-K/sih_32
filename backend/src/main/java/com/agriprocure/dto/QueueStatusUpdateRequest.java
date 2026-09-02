package com.agriprocure.dto;

import com.agriprocure.entity.QueueStatus;
import jakarta.validation.constraints.NotNull;

public class QueueStatusUpdateRequest {

    @NotNull(message = "Status is required")
    private QueueStatus status;

    public QueueStatusUpdateRequest() {
    }

    public QueueStatusUpdateRequest(QueueStatus status) {
        this.status = status;
    }

    public QueueStatus getStatus() {
        return status;
    }

    public void setStatus(QueueStatus status) {
        this.status = status;
    }
}
