package com.agriprocure.repository;

import com.agriprocure.entity.Procurement;
import com.agriprocure.entity.ProcurementStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProcurementRepository extends JpaRepository<Procurement, UUID> {
    Optional<Procurement> findByProcurementCode(String procurementCode);
    Optional<Procurement> findByQueueTokenId(UUID queueTokenId);
    List<Procurement> findByFarmerIdOrderByCreatedAtDesc(UUID farmerId);
    List<Procurement> findByStatus(ProcurementStatus status);
    List<Procurement> findAllByOrderByCreatedAtDesc();
    boolean existsByProcurementCode(String procurementCode);
}
