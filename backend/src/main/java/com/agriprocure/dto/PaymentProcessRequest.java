package com.agriprocure.dto;

public class PaymentProcessRequest {

    private String transactionReference;
    private String remarks;

    public PaymentProcessRequest() {
    }

    public PaymentProcessRequest(String transactionReference, String remarks) {
        this.transactionReference = transactionReference;
        this.remarks = remarks;
    }

    public String getTransactionReference() {
        return transactionReference;
    }

    public void setTransactionReference(String transactionReference) {
        this.transactionReference = transactionReference;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }
}
