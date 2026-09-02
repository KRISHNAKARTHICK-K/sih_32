package com.agriprocure.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.util.UUID;

public class PaymentCreateRequest {

    @NotNull(message = "Procurement ID is required")
    private UUID procurementId;

    @NotNull(message = "Farmer ID is required")
    private UUID farmerId;

    @NotNull(message = "Amount is required")
    @Positive(message = "Payment amount must be positive")
    private BigDecimal amount;

    @NotBlank(message = "Payment method is required")
    private String paymentMethod;

    public PaymentCreateRequest() {
    }

    public PaymentCreateRequest(UUID procurementId, UUID farmerId, BigDecimal amount, String paymentMethod) {
        this.procurementId = procurementId;
        this.farmerId = farmerId;
        this.amount = amount;
        this.paymentMethod = paymentMethod;
    }

    public UUID getProcurementId() {
        return procurementId;
    }

    public void setProcurementId(UUID procurementId) {
        this.procurementId = procurementId;
    }

    public UUID getFarmerId() {
        return farmerId;
    }

    public void setFarmerId(UUID farmerId) {
        this.farmerId = farmerId;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }
}
