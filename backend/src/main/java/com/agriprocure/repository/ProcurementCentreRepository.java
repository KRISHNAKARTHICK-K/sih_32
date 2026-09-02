package com.agriprocure.repository;

import com.agriprocure.entity.ProcurementCentre;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProcurementCentreRepository extends JpaRepository<ProcurementCentre, UUID> {
    Optional<ProcurementCentre> findByCentreCode(String centreCode);
    List<ProcurementCentre> findByActiveTrue();
    boolean existsByCentreCode(String centreCode);
}
