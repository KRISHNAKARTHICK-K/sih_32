package com.agriprocure.repository;

import com.agriprocure.entity.QualityInspection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface QualityInspectionRepository extends JpaRepository<QualityInspection, UUID> {
    Optional<QualityInspection> findByProcurementId(UUID procurementId);
}
