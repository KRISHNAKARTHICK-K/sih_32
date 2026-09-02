package com.agriprocure.repository;

import com.agriprocure.entity.Weighment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface WeighmentRepository extends JpaRepository<Weighment, UUID> {
    Optional<Weighment> findByProcurementId(UUID procurementId);
}
