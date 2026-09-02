package com.agriprocure.repository;

import com.agriprocure.entity.QueueStatus;
import com.agriprocure.entity.QueueToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import jakarta.persistence.LockModeType;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface QueueTokenRepository extends JpaRepository<QueueToken, UUID> {

    Optional<QueueToken> findByBookingId(UUID bookingId);

    Optional<QueueToken> findByDisplayTokenAndQueueDate(String displayToken, LocalDate queueDate);

    List<QueueToken> findByCentreIdAndQueueDateOrderByTokenNumberAsc(UUID centreId, LocalDate queueDate);

    List<QueueToken> findByFarmerIdOrderByCreatedAtDesc(UUID farmerId);

    List<QueueToken> findByCentreIdAndQueueDateAndStatusInOrderByTokenNumberAsc(
            UUID centreId, LocalDate queueDate, Collection<QueueStatus> statuses);

    Optional<QueueToken> findTopByCentreIdAndQueueDateOrderByTokenNumberDesc(UUID centreId, LocalDate queueDate);

    @Query("SELECT COUNT(qt) FROM QueueToken qt WHERE qt.centre.id = :centreId AND qt.queueDate = :queueDate " +
           "AND qt.tokenNumber < :tokenNumber AND qt.status IN :statuses")
    long countPeopleAhead(
            @Param("centreId") UUID centreId,
            @Param("queueDate") LocalDate queueDate,
            @Param("tokenNumber") Integer tokenNumber,
            @Param("statuses") Collection<QueueStatus> statuses);

    @Query("SELECT qt FROM QueueToken qt WHERE qt.centre.id = :centreId AND qt.queueDate = :queueDate " +
           "AND qt.status IN :activeStatuses ORDER BY qt.tokenNumber DESC LIMIT 1")
    Optional<QueueToken> findCurrentActiveToken(
            @Param("centreId") UUID centreId,
            @Param("queueDate") LocalDate queueDate,
            @Param("activeStatuses") Collection<QueueStatus> activeStatuses);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT qt FROM QueueToken qt WHERE qt.centre.id = :centreId AND qt.queueDate = :queueDate " +
           "AND qt.status IN :statuses ORDER BY qt.tokenNumber ASC LIMIT 1")
    Optional<QueueToken> findNextWaitingTokenWithLock(
            @Param("centreId") UUID centreId,
            @Param("queueDate") LocalDate queueDate,
            @Param("statuses") Collection<QueueStatus> statuses);
}
