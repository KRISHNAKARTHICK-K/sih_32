package com.agriprocure.repository;

import com.agriprocure.entity.Slot;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SlotRepository extends JpaRepository<Slot, UUID> {

    List<Slot> findByCentreIdAndSlotDateOrderByStartTimeAsc(UUID centreId, LocalDate slotDate);

    List<Slot> findByCentreIdAndSlotDateAndActiveTrueOrderByStartTimeAsc(UUID centreId, LocalDate slotDate);

    List<Slot> findByCentreIdAndActiveTrue(UUID centreId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM Slot s WHERE s.id = :id")
    Optional<Slot> findByIdWithPessimisticLock(@Param("id") UUID id);
}
