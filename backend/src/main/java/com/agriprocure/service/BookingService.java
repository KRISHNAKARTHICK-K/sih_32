package com.agriprocure.service;

import com.agriprocure.dto.BookingCreateRequest;
import com.agriprocure.dto.BookingResponse;
import com.agriprocure.entity.*;
import com.agriprocure.exception.BookingConflictException;
import com.agriprocure.exception.ResourceNotFoundException;
import com.agriprocure.exception.SlotFullException;
import com.agriprocure.exception.ValidationException;
import com.agriprocure.repository.BookingRepository;
import com.agriprocure.repository.CropRepository;
import com.agriprocure.repository.FarmerRepository;
import com.agriprocure.repository.SlotRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.Year;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class BookingService {

    private final BookingRepository bookingRepository;
    private final FarmerRepository farmerRepository;
    private final SlotRepository slotRepository;
    private final CropRepository cropRepository;
    private final QueueService queueService;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;
    private final com.agriprocure.websocket.WebSocketEventPublisher eventPublisher;

    public BookingService(BookingRepository bookingRepository,
                          FarmerRepository farmerRepository,
                          SlotRepository slotRepository,
                          CropRepository cropRepository,
                          QueueService queueService,
                          NotificationService notificationService,
                          AuditLogService auditLogService,
                          com.agriprocure.websocket.WebSocketEventPublisher eventPublisher) {
        this.bookingRepository = bookingRepository;
        this.farmerRepository = farmerRepository;
        this.slotRepository = slotRepository;
        this.cropRepository = cropRepository;
        this.queueService = queueService;
        this.notificationService = notificationService;
        this.auditLogService = auditLogService;
        this.eventPublisher = eventPublisher;
    }

    public BookingResponse createBooking(BookingCreateRequest request) {
        Farmer farmer = farmerRepository.findById(request.getFarmerId())
                .orElseThrow(() -> new ResourceNotFoundException("Farmer not found with ID: " + request.getFarmerId()));

        Crop crop = cropRepository.findById(request.getCropId())
                .orElseThrow(() -> new ResourceNotFoundException("Crop not found with ID: " + request.getCropId()));

        // Concurrency-Safe Pessimistic Lock on Slot row
        Slot slot = slotRepository.findByIdWithPessimisticLock(request.getSlotId())
                .orElseThrow(() -> new ResourceNotFoundException("Slot not found with ID: " + request.getSlotId()));

        if (!slot.isActive()) {
            throw new ValidationException("Selected slot is currently inactive");
        }

        if (slot.getSlotDate().isBefore(LocalDate.now())) {
            throw new ValidationException("Cannot book slots in the past");
        }

        // Strict Capacity Check under lock
        if (slot.getBookedCount() >= slot.getCapacity()) {
            throw new SlotFullException("Slot is already full. Capacity of " + slot.getCapacity() + " reached.");
        }

        // Increment booked count
        slot.setBookedCount(slot.getBookedCount() + 1);
        slotRepository.save(slot);

        // Generate unique booking code BK-YYYY-XXXXXX
        int year = Year.now().getValue();
        long count = bookingRepository.count() + 1;
        String bookingCode = String.format("BK-%d-%06d", year, count);
        while (bookingRepository.existsByBookingCode(bookingCode)) {
            count++;
            bookingCode = String.format("BK-%d-%06d", year, count);
        }

        Booking booking = new Booking(
                bookingCode,
                farmer,
                slot,
                crop,
                request.getDeclaredQuantity(),
                BookingStatus.CONFIRMED
        );

        Booking savedBooking = bookingRepository.save(booking);

        // Automatically issue queue token for the booking
        QueueToken token = queueService.generateToken(savedBooking);

        notificationService.sendNotification(
                farmer.getUser(),
                "Booking Confirmed: " + savedBooking.getBookingCode(),
                "Slot booked for " + crop.getName() + " on " + slot.getSlotDate() + " (" + slot.getStartTime() + "-" + slot.getEndTime() + "). Queue Token: " + token.getDisplayToken(),
                NotificationType.BOOKING
        );

        auditLogService.logAction(
                farmer.getUser(),
                "CREATE_BOOKING",
                "BOOKING",
                savedBooking.getId().toString(),
                "Booking created: " + savedBooking.getBookingCode() + " with Token: " + token.getDisplayToken()
        );

        BookingResponse response = mapToResponse(savedBooking, token.getDisplayToken());

        com.agriprocure.dto.RealtimeEvent bookingEvent = new com.agriprocure.dto.RealtimeEvent(
                com.agriprocure.dto.RealtimeEventType.BOOKING_CREATED,
                slot.getCentre().getId(),
                "BOOKING",
                savedBooking.getId().toString(),
                response
        );
        eventPublisher.publishToCentre(slot.getCentre().getId(), "bookings", bookingEvent);
        eventPublisher.publishToAdmin(bookingEvent);

        // Also publish slot capacity update to centre
        com.agriprocure.dto.RealtimeEvent slotEvent = new com.agriprocure.dto.RealtimeEvent(
                com.agriprocure.dto.RealtimeEventType.SLOT_UPDATED,
                slot.getCentre().getId(),
                "SLOT",
                slot.getId().toString(),
                new com.agriprocure.dto.SlotResponse(
                        slot.getId(),
                        slot.getCentre().getId(),
                        slot.getCentre().getName(),
                        slot.getCentre().getCentreCode(),
                        slot.getSlotDate(),
                        slot.getStartTime(),
                        slot.getEndTime(),
                        slot.getCapacity(),
                        slot.getBookedCount(),
                        slot.getAvailableCapacity(),
                        slot.isActive(),
                        slot.getCreatedAt()
                )
        );
        eventPublisher.publishToCentre(slot.getCentre().getId(), "slots", slotEvent);

        return response;
    }

    @Transactional(readOnly = true)
    public BookingResponse getBookingById(UUID id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + id));
        return mapToResponse(booking, null);
    }

    @Transactional(readOnly = true)
    public BookingResponse getBookingByCode(String bookingCode) {
        Booking booking = bookingRepository.findByBookingCode(bookingCode)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with code: " + bookingCode));
        return mapToResponse(booking, null);
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getBookingsByFarmer(UUID farmerId) {
        return bookingRepository.findByFarmerIdOrderByCreatedAtDesc(farmerId).stream()
                .map(b -> mapToResponse(b, null))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getBookingsByCentre(UUID centreId) {
        return bookingRepository.findByCentreId(centreId).stream()
                .map(b -> mapToResponse(b, null))
                .collect(Collectors.toList());
    }

    public BookingResponse mapToResponse(Booking booking, String displayToken) {
        BookingResponse response = new BookingResponse();
        response.setId(booking.getId());
        response.setBookingCode(booking.getBookingCode());
        response.setFarmerId(booking.getFarmer().getId());
        response.setFarmerName(booking.getFarmer().getFullName());
        response.setFarmerCode(booking.getFarmer().getFarmerCode());
        response.setSlotId(booking.getSlot().getId());
        response.setCentreId(booking.getSlot().getCentre().getId());
        response.setCentreName(booking.getSlot().getCentre().getName());
        response.setSlotDate(booking.getSlot().getSlotDate());
        response.setStartTime(booking.getSlot().getStartTime());
        response.setEndTime(booking.getSlot().getEndTime());
        response.setCropId(booking.getCrop().getId());
        response.setCropName(booking.getCrop().getName());
        response.setDeclaredQuantity(booking.getDeclaredQuantity());
        response.setStatus(booking.getStatus());
        response.setQueueToken(displayToken);
        response.setCreatedAt(booking.getCreatedAt());
        return response;
    }
}
