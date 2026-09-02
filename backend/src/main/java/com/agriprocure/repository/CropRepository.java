package com.agriprocure.repository;

import com.agriprocure.entity.Crop;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CropRepository extends JpaRepository<Crop, UUID> {
    Optional<Crop> findByCode(String code);
    List<Crop> findByActiveTrue();
    boolean existsByCode(String code);
}
