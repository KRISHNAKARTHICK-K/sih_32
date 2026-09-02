package com.agriprocure.repository;

import com.agriprocure.entity.CentreStaff;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CentreStaffRepository extends JpaRepository<CentreStaff, UUID> {
    List<CentreStaff> findByCentreId(UUID centreId);
    Optional<CentreStaff> findByUserId(UUID userId);
    List<CentreStaff> findByCentreIdAndActiveTrue(UUID centreId);
}
