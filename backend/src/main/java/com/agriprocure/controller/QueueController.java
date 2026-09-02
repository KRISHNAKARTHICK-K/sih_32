package com.agriprocure.controller;

import com.agriprocure.dto.ApiResponse;
import com.agriprocure.dto.QueueOverviewResponse;
import com.agriprocure.dto.QueueStatusUpdateRequest;
import com.agriprocure.dto.QueueTokenResponse;
import com.agriprocure.security.SecurityUtils;
import com.agriprocure.service.QueueService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/queues")
public class QueueController {

    private final QueueService queueService;

    public QueueController(QueueService queueService) {
        this.queueService = queueService;
    }

    @GetMapping("/{centreId}")
    public ResponseEntity<ApiResponse<QueueOverviewResponse>> getQueueOverview(
            @PathVariable UUID centreId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        QueueOverviewResponse overview = queueService.getQueueOverview(centreId, date);
        return ResponseEntity.ok(ApiResponse.success("Queue status retrieved successfully", overview));
    }

    @GetMapping("/farmers/{farmerId}")
    public ResponseEntity<ApiResponse<List<QueueTokenResponse>>> getFarmerQueueTokens(@PathVariable UUID farmerId) {
        if (!SecurityUtils.canAccessFarmerData(farmerId)) {
            throw new AccessDeniedException("Access denied. You can only view your own queue tokens.");
        }
        List<QueueTokenResponse> tokens = queueService.getFarmerQueueTokens(farmerId);
        return ResponseEntity.ok(ApiResponse.success("Farmer queue tokens retrieved", tokens));
    }

    @GetMapping("/tokens/{id}")
    public ResponseEntity<ApiResponse<QueueTokenResponse>> getTokenById(@PathVariable UUID id) {
        QueueTokenResponse token = queueService.getTokenById(id);

        if (SecurityUtils.isFarmer() && !SecurityUtils.isSelfFarmer(token.getFarmerId())) {
            throw new AccessDeniedException("Access denied. You cannot view another farmer's queue token.");
        }

        if ((SecurityUtils.isOperator() || SecurityUtils.isCentreManager()) &&
                !SecurityUtils.isAssignedCentre(token.getCentreId())) {
            throw new AccessDeniedException("Access denied. You cannot view queue tokens from another centre.");
        }

        return ResponseEntity.ok(ApiResponse.success(token));
    }

    @PatchMapping("/tokens/{id}/status")
    @PreAuthorize("hasAnyRole('OPERATOR', 'CENTRE_MANAGER', 'ADMIN')")
    public ResponseEntity<ApiResponse<QueueTokenResponse>> updateTokenStatus(
            @PathVariable UUID id,
            @Valid @RequestBody QueueStatusUpdateRequest request) {
        QueueTokenResponse token = queueService.getTokenById(id);
        if (!SecurityUtils.canAccessCentreData(token.getCentreId())) {
            throw new AccessDeniedException("Access denied. You cannot manage queue tokens for another centre.");
        }
        QueueTokenResponse updated = queueService.updateTokenStatus(id, request);
        return ResponseEntity.ok(ApiResponse.success("Queue token status updated", updated));
    }

    @PostMapping("/{centreId}/call-next")
    @PreAuthorize("hasAnyRole('OPERATOR', 'CENTRE_MANAGER', 'ADMIN')")
    public ResponseEntity<ApiResponse<QueueTokenResponse>> callNextWaitingToken(
            @PathVariable UUID centreId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        if (!SecurityUtils.canAccessCentreData(centreId)) {
            throw new AccessDeniedException("Access denied. You cannot manage queue for another centre.");
        }
        QueueTokenResponse nextToken = queueService.callNextWaitingToken(centreId, date);
        return ResponseEntity.ok(ApiResponse.success("Next waiting token called", nextToken));
    }
}
