package com.agriprocure.repository;

import com.agriprocure.entity.Booking;
import com.agriprocure.entity.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BookingRepository extends JpaRepository<Booking, UUID> {
    Optional<Booking> findByBookingCode(String bookingCode);
    List<Booking> findByFarmerIdOrderByCreatedAtDesc(UUID farmerId);
    List<Booking> findBySlotId(UUID slotId);
    List<Booking> findByStatus(BookingStatus status);
    List<Booking> findAllByOrderByCreatedAtDesc();
    boolean existsByBookingCode(String bookingCode);

    @org.springframework.data.jpa.repository.Query("SELECT b FROM Booking b WHERE b.slot.centre.id = :centreId ORDER BY b.createdAt DESC")
    List<Booking> findByCentreId(@org.springframework.data.repository.query.Param("centreId") UUID centreId);
}
