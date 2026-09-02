package com.agriprocure.service;

import com.agriprocure.dto.PaymentCreateRequest;
import com.agriprocure.dto.PaymentProcessRequest;
import com.agriprocure.dto.PaymentResponse;
import com.agriprocure.entity.*;
import com.agriprocure.exception.InvalidStateTransitionException;
import com.agriprocure.exception.ResourceNotFoundException;
import com.agriprocure.repository.FarmerRepository;
import com.agriprocure.repository.PaymentRepository;
import com.agriprocure.repository.ProcurementRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.Year;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final ProcurementRepository procurementRepository;
    private final FarmerRepository farmerRepository;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;
    private final com.agriprocure.websocket.WebSocketEventPublisher eventPublisher;

    public PaymentService(PaymentRepository paymentRepository,
                          ProcurementRepository procurementRepository,
                          FarmerRepository farmerRepository,
                          NotificationService notificationService,
                          AuditLogService auditLogService,
                          com.agriprocure.websocket.WebSocketEventPublisher eventPublisher) {
        this.paymentRepository = paymentRepository;
        this.procurementRepository = procurementRepository;
        this.farmerRepository = farmerRepository;
        this.notificationService = notificationService;
        this.auditLogService = auditLogService;
        this.eventPublisher = eventPublisher;
    }

    public PaymentResponse createPayment(PaymentCreateRequest request) {
        Procurement procurement = procurementRepository.findById(request.getProcurementId())
                .orElseThrow(() -> new ResourceNotFoundException("Procurement not found with ID: " + request.getProcurementId()));

        Farmer farmer = farmerRepository.findById(request.getFarmerId())
                .orElseThrow(() -> new ResourceNotFoundException("Farmer not found with ID: " + request.getFarmerId()));

        int year = Year.now().getValue();
        long count = paymentRepository.count() + 1;
        String paymentCode = String.format("PAY-%d-%06d", year, count);
        while (paymentRepository.existsByPaymentCode(paymentCode)) {
            count++;
            paymentCode = String.format("PAY-%d-%06d", year, count);
        }

        Payment payment = new Payment(
                paymentCode,
                procurement,
                farmer,
                request.getAmount(),
                request.getPaymentMethod(),
                null,
                PaymentStatus.PENDING
        );

        Payment saved = paymentRepository.save(payment);

        auditLogService.logAction(
                farmer.getUser(),
                "CREATE_PAYMENT",
                "PAYMENT",
                saved.getId().toString(),
                "Payment voucher created: " + saved.getPaymentCode() + " for ₹" + saved.getAmount()
        );

        return mapToResponse(saved);
    }

    public PaymentResponse processPayment(UUID paymentId, PaymentProcessRequest request) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with ID: " + paymentId));

        if (payment.getStatus() == PaymentStatus.PAID) {
            throw new InvalidStateTransitionException("Payment is already settled and PAID");
        }

        // Simulate electronic disbursement
        String txnRef = (request != null && request.getTransactionReference() != null && !request.getTransactionReference().isBlank())
                ? request.getTransactionReference()
                : "TXN-" + Year.now().getValue() + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        payment.setTransactionReference(txnRef);
        payment.setStatus(PaymentStatus.PAID);
        payment.setProcessedAt(Instant.now());

        Payment saved = paymentRepository.save(payment);

        // Transition procurement to COMPLETED
        Procurement procurement = payment.getProcurement();
        if (procurement != null) {
            procurement.setStatus(ProcurementStatus.COMPLETED);
            procurement.setCompletedAt(Instant.now());
            procurementRepository.save(procurement);
        }

        notificationService.sendNotification(
                payment.getFarmer().getUser(),
                "Payment Disbursed: ₹" + payment.getAmount(),
                "Your payment " + payment.getPaymentCode() + " has been successfully credited via " + payment.getPaymentMethod() + ". Ref: " + txnRef,
                NotificationType.PAYMENT
        );

        auditLogService.logAction(
                payment.getFarmer().getUser(),
                "PROCESS_PAYMENT",
                "PAYMENT",
                saved.getId().toString(),
                "Payment processed successfully. Ref: " + txnRef
        );

        PaymentResponse response = mapToResponse(saved);

        UUID centreId = (procurement != null && procurement.getQueueToken() != null)
                ? procurement.getQueueToken().getCentre().getId()
                : null;

        com.agriprocure.dto.RealtimeEvent event = new com.agriprocure.dto.RealtimeEvent(
                com.agriprocure.dto.RealtimeEventType.PAYMENT_PROCESSED,
                centreId,
                "PAYMENT",
                saved.getId().toString(),
                response
        );

        if (centreId != null) {
            eventPublisher.publishToCentre(centreId, "payments", event);
        }
        if (payment.getFarmer() != null && payment.getFarmer().getUser() != null) {
            eventPublisher.publishToUser(payment.getFarmer().getUser().getUsername(), "payments", event);
        }
        eventPublisher.publishToAdmin(event);

        return response;
    }

    @Transactional(readOnly = true)
    public List<PaymentResponse> getAllPayments() {
        return paymentRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PaymentResponse getPaymentById(UUID id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with ID: " + id));
        return mapToResponse(payment);
    }

    @Transactional(readOnly = true)
    public List<PaymentResponse> getFarmerPayments(UUID farmerId) {
        return paymentRepository.findByFarmerIdOrderByCreatedAtDesc(farmerId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PaymentResponse> getCentrePayments(UUID centreId) {
        return paymentRepository.findAll().stream()
                .filter(p -> p.getProcurement() != null &&
                             p.getProcurement().getQueueToken() != null &&
                             p.getProcurement().getQueueToken().getCentre().getId().equals(centreId))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public PaymentResponse mapToResponse(Payment p) {
        PaymentResponse response = new PaymentResponse();
        response.setId(p.getId());
        response.setPaymentCode(p.getPaymentCode());
        response.setProcurementId(p.getProcurement().getId());
        response.setProcurementCode(p.getProcurement().getProcurementCode());
        response.setFarmerId(p.getFarmer().getId());
        response.setFarmerName(p.getFarmer().getFullName());
        response.setFarmerCode(p.getFarmer().getFarmerCode());
        response.setAmount(p.getAmount());
        response.setPaymentMethod(p.getPaymentMethod());
        response.setTransactionReference(p.getTransactionReference());
        response.setStatus(p.getStatus());
        response.setProcessedAt(p.getProcessedAt());
        response.setCreatedAt(p.getCreatedAt());
        return response;
    }
}
