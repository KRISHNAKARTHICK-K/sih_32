package com.agriprocure.repository;

import com.agriprocure.entity.Farmer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface FarmerRepository extends JpaRepository<Farmer, UUID> {
    Optional<Farmer> findByFarmerCode(String farmerCode);
    Optional<Farmer> findByUserId(UUID userId);
    Optional<Farmer> findByMobile(String mobile);
    boolean existsByFarmerCode(String farmerCode);
    boolean existsByMobile(String mobile);
}
