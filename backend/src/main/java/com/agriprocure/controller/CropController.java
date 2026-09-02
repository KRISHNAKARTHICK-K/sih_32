package com.agriprocure.controller;

import com.agriprocure.dto.ApiResponse;
import com.agriprocure.dto.CropPriceResponse;
import com.agriprocure.dto.CropResponse;
import com.agriprocure.service.CropService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/crops")
public class CropController {

    private final CropService cropService;

    public CropController(CropService cropService) {
        this.cropService = cropService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<CropResponse>>> getAllCrops() {
        List<CropResponse> crops = cropService.getAllActiveCrops();
        return ResponseEntity.ok(ApiResponse.success("Crops retrieved successfully", crops));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CropResponse>> getCropById(@PathVariable UUID id) {
        CropResponse crop = cropService.getCropById(id);
        return ResponseEntity.ok(ApiResponse.success(crop));
    }

    @GetMapping("/{id}/prices")
    public ResponseEntity<ApiResponse<List<CropPriceResponse>>> getCropPriceHistory(@PathVariable UUID id) {
        List<CropPriceResponse> prices = cropService.getCropPriceHistory(id);
        return ResponseEntity.ok(ApiResponse.success(prices));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> createCrop() {
        // Admin-only placeholder
        return ResponseEntity.ok(ApiResponse.success("Crop created", null));
    }
}
