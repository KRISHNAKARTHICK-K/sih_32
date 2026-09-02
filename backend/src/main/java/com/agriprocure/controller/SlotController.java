package com.agriprocure.controller;

import com.agriprocure.dto.ApiResponse;
import com.agriprocure.dto.SlotCreateRequest;
import com.agriprocure.dto.SlotResponse;
import com.agriprocure.security.SecurityUtils;
import com.agriprocure.service.SlotService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class SlotController {

    private final SlotService slotService;

    public SlotController(SlotService slotService) {
        this.slotService = slotService;
    }

    @GetMapping("/centres/{centreId}/slots")
    public ResponseEntity<ApiResponse<List<SlotResponse>>> getSlotsByCentre(
            @PathVariable UUID centreId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<SlotResponse> slots = (date != null)
                ? slotService.getSlotsByCentreAndDate(centreId, date)
                : slotService.getSlotsByCentre(centreId);
        return ResponseEntity.ok(ApiResponse.success("Slots retrieved successfully", slots));
    }

    @GetMapping("/slots/{id}")
    public ResponseEntity<ApiResponse<SlotResponse>> getSlotById(@PathVariable UUID id) {
        SlotResponse slot = slotService.getSlotById(id);
        return ResponseEntity.ok(ApiResponse.success(slot));
    }

    @PostMapping("/centres/{centreId}/slots")
    @PreAuthorize("hasAnyRole('ADMIN', 'CENTRE_MANAGER')")
    public ResponseEntity<ApiResponse<SlotResponse>> createSlot(
            @PathVariable UUID centreId,
            @Valid @RequestBody SlotCreateRequest request) {
        if (!SecurityUtils.canAccessCentreData(centreId)) {
            throw new AccessDeniedException("Access denied. You can only manage slots for your assigned procurement centre.");
        }
        request.setCentreId(centreId);
        SlotResponse slot = slotService.createSlot(request);
        return new ResponseEntity<>(ApiResponse.success("Slot created successfully", slot), HttpStatus.CREATED);
    }

    @PatchMapping("/slots/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'CENTRE_MANAGER')")
    public ResponseEntity<ApiResponse<SlotResponse>> updateSlotStatus(
            @PathVariable UUID id,
            @RequestParam boolean active) {
        SlotResponse existing = slotService.getSlotById(id);
        if (!SecurityUtils.canAccessCentreData(existing.getCentreId())) {
            throw new AccessDeniedException("Access denied. You can only manage slots for your assigned procurement centre.");
        }
        SlotResponse updated = slotService.updateSlotStatus(id, active);
        return ResponseEntity.ok(ApiResponse.success("Slot status updated successfully", updated));
    }
}
