package com.agriprocure.controller;

import com.agriprocure.dto.ApiResponse;
import com.agriprocure.dto.PaymentCreateRequest;
import com.agriprocure.dto.PaymentProcessRequest;
import com.agriprocure.dto.PaymentResponse;
import com.agriprocure.security.SecurityUtils;
import com.agriprocure.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @GetMapping("/payments")
    @PreAuthorize("hasAnyRole('ADMIN', 'CENTRE_MANAGER')")
    public ResponseEntity<ApiResponse<List<PaymentResponse>>> getAllPayments() {
        List<PaymentResponse> payments = paymentService.getAllPayments();
        return ResponseEntity.ok(ApiResponse.success("Payments retrieved successfully", payments));
    }

    @GetMapping("/payments/{id}")
    public ResponseEntity<ApiResponse<PaymentResponse>> getPaymentById(@PathVariable UUID id) {
        PaymentResponse payment = paymentService.getPaymentById(id);

        if (SecurityUtils.isFarmer() && !SecurityUtils.isSelfFarmer(payment.getFarmerId())) {
            throw new AccessDeniedException("Access denied. You cannot view another farmer's payment.");
        }

        return ResponseEntity.ok(ApiResponse.success(payment));
    }

    @GetMapping("/farmers/{farmerId}/payments")
    public ResponseEntity<ApiResponse<List<PaymentResponse>>> getFarmerPayments(@PathVariable UUID farmerId) {
        if (!SecurityUtils.canAccessFarmerData(farmerId)) {
            throw new AccessDeniedException("Access denied. You can only view your own payment vouchers.");
        }
        List<PaymentResponse> payments = paymentService.getFarmerPayments(farmerId);
        return ResponseEntity.ok(ApiResponse.success("Farmer payments retrieved", payments));
    }

    @GetMapping("/centres/{centreId}/payments")
    @PreAuthorize("hasAnyRole('ADMIN', 'CENTRE_MANAGER')")
    public ResponseEntity<ApiResponse<List<PaymentResponse>>> getCentrePayments(@PathVariable UUID centreId) {
        if (!SecurityUtils.canAccessCentreData(centreId)) {
            throw new AccessDeniedException("Access denied. You cannot view payments for another centre.");
        }
        List<PaymentResponse> payments = paymentService.getCentrePayments(centreId);
        return ResponseEntity.ok(ApiResponse.success("Centre payments retrieved", payments));
    }

    @PostMapping("/payments")
    @PreAuthorize("hasAnyRole('ADMIN', 'CENTRE_MANAGER')")
    public ResponseEntity<ApiResponse<PaymentResponse>> createPayment(@Valid @RequestBody PaymentCreateRequest request) {
        PaymentResponse payment = paymentService.createPayment(request);
        return new ResponseEntity<>(ApiResponse.success("Payment voucher created", payment), HttpStatus.CREATED);
    }

    @PostMapping("/payments/{id}/process")
    @PreAuthorize("hasAnyRole('ADMIN', 'CENTRE_MANAGER')")
    public ResponseEntity<ApiResponse<PaymentResponse>> processPayment(
            @PathVariable UUID id,
            @RequestBody(required = false) PaymentProcessRequest request) {
        PaymentResponse payment = paymentService.processPayment(id, request);
        return ResponseEntity.ok(ApiResponse.success("Payment processed and disbursed successfully", payment));
    }
}
