package com.agriprocure.controller;

import com.agriprocure.dto.*;
import com.agriprocure.security.SecurityUtils;
import com.agriprocure.service.ProcurementService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/procurements")
public class ProcurementController {

    private final ProcurementService procurementService;

    public ProcurementController(ProcurementService procurementService) {
        this.procurementService = procurementService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'CENTRE_MANAGER', 'OPERATOR')")
    public ResponseEntity<ApiResponse<List<ProcurementResponse>>> getAllProcurements() {
        List<ProcurementResponse> procurements = procurementService.getAllProcurements();
        return ResponseEntity.ok(ApiResponse.success("Procurements retrieved successfully", procurements));
    }

    @GetMapping("/farmers/{farmerId}")
    public ResponseEntity<ApiResponse<List<ProcurementResponse>>> getFarmerProcurements(@PathVariable UUID farmerId) {
        if (!SecurityUtils.canAccessFarmerData(farmerId)) {
            throw new AccessDeniedException("Access denied. You can only view your own procurement records.");
        }
        List<ProcurementResponse> procurements = procurementService.getFarmerProcurements(farmerId);
        return ResponseEntity.ok(ApiResponse.success("Farmer procurements retrieved successfully", procurements));
    }

    @GetMapping("/token/{queueTokenId}")
    @PreAuthorize("hasAnyRole('OPERATOR', 'CENTRE_MANAGER', 'ADMIN')")
    public ResponseEntity<ApiResponse<ProcurementResponse>> getOrCreateProcurementForToken(@PathVariable UUID queueTokenId) {
        ProcurementResponse procurement = procurementService.getOrCreateProcurementForToken(queueTokenId);
        return ResponseEntity.ok(ApiResponse.success("Procurement for token retrieved", procurement));
    }

    @GetMapping("/centre/{centreId}")
    @PreAuthorize("hasAnyRole('OPERATOR', 'CENTRE_MANAGER', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<ProcurementResponse>>> getCentreProcurements(@PathVariable UUID centreId) {
        if (!SecurityUtils.canAccessCentreData(centreId)) {
            throw new AccessDeniedException("Access denied. You cannot view procurements for another centre.");
        }
        List<ProcurementResponse> procurements = procurementService.getCentreProcurements(centreId);
        return ResponseEntity.ok(ApiResponse.success("Centre procurements retrieved", procurements));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProcurementResponse>> getProcurementById(@PathVariable UUID id) {
        ProcurementResponse procurement = procurementService.getProcurementById(id);

        if (SecurityUtils.isFarmer() && !SecurityUtils.isSelfFarmer(procurement.getFarmerId())) {
            throw new AccessDeniedException("Access denied. You cannot view another farmer's procurement records.");
        }

        return ResponseEntity.ok(ApiResponse.success(procurement));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'CENTRE_MANAGER', 'OPERATOR')")
    public ResponseEntity<ApiResponse<ProcurementResponse>> createProcurement(@Valid @RequestBody ProcurementCreateRequest request) {
        ProcurementResponse procurement = procurementService.createProcurement(request);
        return new ResponseEntity<>(ApiResponse.success("Procurement intake recorded", procurement), HttpStatus.CREATED);
    }

    @PostMapping("/{id}/weighment")
    @PreAuthorize("hasAnyRole('ADMIN', 'CENTRE_MANAGER', 'OPERATOR')")
    public ResponseEntity<ApiResponse<WeighmentResponse>> recordWeighment(
            @PathVariable UUID id,
            @Valid @RequestBody WeighmentRequest request) {
        request.setProcurementId(id);
        WeighmentResponse weighment = procurementService.recordWeighment(id, request);
        return new ResponseEntity<>(ApiResponse.success("Weighment recorded successfully", weighment), HttpStatus.CREATED);
    }

    @PostMapping("/{id}/inspection")
    @PreAuthorize("hasAnyRole('ADMIN', 'CENTRE_MANAGER', 'OPERATOR')")
    public ResponseEntity<ApiResponse<QualityInspectionResponse>> recordInspection(
            @PathVariable UUID id,
            @Valid @RequestBody QualityInspectionRequest request) {
        request.setProcurementId(id);
        QualityInspectionResponse inspection = procurementService.recordInspection(id, request);
        return new ResponseEntity<>(ApiResponse.success("Quality inspection recorded successfully", inspection), HttpStatus.CREATED);
    }
}
