package com.agriprocure.repository;

import com.agriprocure.entity.Payment;
import com.agriprocure.entity.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, UUID> {
    Optional<Payment> findByPaymentCode(String paymentCode);
    Optional<Payment> findByTransactionReference(String transactionReference);
    List<Payment> findByProcurementId(UUID procurementId);
    List<Payment> findByFarmerIdOrderByCreatedAtDesc(UUID farmerId);
    List<Payment> findByStatus(PaymentStatus status);
    List<Payment> findAllByOrderByCreatedAtDesc();
    boolean existsByPaymentCode(String paymentCode);
}
