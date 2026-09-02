package com.agriprocure.repository;

import com.agriprocure.entity.CropPrice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CropPriceRepository extends JpaRepository<CropPrice, UUID> {
    List<CropPrice> findByCropIdAndActiveTrue(UUID cropId);
    List<CropPrice> findAllByOrderByEffectiveFromDesc();

    @Query("SELECT cp FROM CropPrice cp WHERE cp.crop.id = :cropId AND cp.active = true AND cp.effectiveFrom <= :date AND (cp.effectiveTo IS NULL OR cp.effectiveTo >= :date) ORDER BY cp.effectiveFrom DESC")
    Optional<CropPrice> findCurrentPriceByCropId(@Param("cropId") UUID cropId, @Param("date") LocalDate date);

    @Query("SELECT cp FROM CropPrice cp WHERE cp.crop.code = :cropCode AND cp.active = true AND cp.effectiveFrom <= :date AND (cp.effectiveTo IS NULL OR cp.effectiveTo >= :date) ORDER BY cp.effectiveFrom DESC")
    Optional<CropPrice> findCurrentPriceByCropCode(@Param("cropCode") String cropCode, @Param("date") LocalDate date);
}
