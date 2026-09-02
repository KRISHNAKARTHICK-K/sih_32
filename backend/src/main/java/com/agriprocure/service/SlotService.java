package com.agriprocure.service;

import com.agriprocure.dto.SlotCreateRequest;
import com.agriprocure.dto.SlotResponse;
import com.agriprocure.entity.ProcurementCentre;
import com.agriprocure.entity.Slot;
import com.agriprocure.exception.ResourceNotFoundException;
import com.agriprocure.exception.ValidationException;
import com.agriprocure.repository.ProcurementCentreRepository;
import com.agriprocure.repository.SlotRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class SlotService {

    private final SlotRepository slotRepository;
    private final ProcurementCentreRepository centreRepository;
    private final com.agriprocure.websocket.WebSocketEventPublisher eventPublisher;

    public SlotService(SlotRepository slotRepository,
                       ProcurementCentreRepository centreRepository,
                       com.agriprocure.websocket.WebSocketEventPublisher eventPublisher) {
        this.slotRepository = slotRepository;
        this.centreRepository = centreRepository;
        this.eventPublisher = eventPublisher;
    }

    @Transactional(readOnly = true)
    public List<SlotResponse> getSlotsByCentreAndDate(UUID centreId, LocalDate slotDate) {
        return slotRepository.findByCentreIdAndSlotDateAndActiveTrueOrderByStartTimeAsc(centreId, slotDate).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<SlotResponse> getSlotsByCentre(UUID centreId) {
        return slotRepository.findByCentreIdAndActiveTrue(centreId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SlotResponse getSlotById(UUID id) {
        Slot slot = slotRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Slot not found with ID: " + id));
        return mapToResponse(slot);
    }

    public SlotResponse createSlot(SlotCreateRequest request) {
        ProcurementCentre centre = centreRepository.findById(request.getCentreId())
                .orElseThrow(() -> new ResourceNotFoundException("Procurement centre not found with ID: " + request.getCentreId()));

        if (request.getStartTime().isAfter(request.getEndTime()) || request.getStartTime().equals(request.getEndTime())) {
            throw new ValidationException("Start time must be strictly before end time");
        }

        Slot slot = new Slot(
                centre,
                request.getSlotDate(),
                request.getStartTime(),
                request.getEndTime(),
                request.getCapacity()
        );

        Slot saved = slotRepository.save(slot);
        SlotResponse response = mapToResponse(saved);

        com.agriprocure.dto.RealtimeEvent event = new com.agriprocure.dto.RealtimeEvent(
                com.agriprocure.dto.RealtimeEventType.SLOT_UPDATED,
                centre.getId(),
                "SLOT",
                saved.getId().toString(),
                response
        );
        eventPublisher.publishToCentre(centre.getId(), "slots", event);
        eventPublisher.publishToAdmin(event);

        return response;
    }

    public SlotResponse updateSlotStatus(UUID slotId, boolean active) {
        Slot slot = slotRepository.findById(slotId)
                .orElseThrow(() -> new ResourceNotFoundException("Slot not found with ID: " + slotId));
        slot.setActive(active);
        Slot saved = slotRepository.save(slot);
        SlotResponse response = mapToResponse(saved);

        com.agriprocure.dto.RealtimeEvent event = new com.agriprocure.dto.RealtimeEvent(
                com.agriprocure.dto.RealtimeEventType.SLOT_UPDATED,
                slot.getCentre().getId(),
                "SLOT",
                saved.getId().toString(),
                response
        );
        eventPublisher.publishToCentre(slot.getCentre().getId(), "slots", event);
        eventPublisher.publishToAdmin(event);

        return response;
    }

    public SlotResponse mapToResponse(Slot slot) {
        return new SlotResponse(
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
        );
    }
}
