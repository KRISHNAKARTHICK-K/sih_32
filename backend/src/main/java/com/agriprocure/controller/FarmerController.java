package com.agriprocure.controller;

import com.agriprocure.dto.ApiResponse;
import com.agriprocure.dto.FarmerCreateRequest;
import com.agriprocure.dto.FarmerResponse;
import com.agriprocure.security.SecurityUtils;
import com.agriprocure.service.FarmerService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/farmers")
public class FarmerController {

    private final FarmerService farmerService;

    public FarmerController(FarmerService farmerService) {
        this.farmerService = farmerService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'CENTRE_MANAGER', 'OPERATOR')")
    public ResponseEntity<ApiResponse<List<FarmerResponse>>> getAllFarmers() {
        List<FarmerResponse> farmers = farmerService.getAllFarmers();
        return ResponseEntity.ok(ApiResponse.success("Farmers retrieved successfully", farmers));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<FarmerResponse>> getFarmerById(@PathVariable UUID id) {
        if (!SecurityUtils.canAccessFarmerData(id)) {
            throw new AccessDeniedException("Access denied. You can only access your own farmer profile.");
        }
        FarmerResponse farmer = farmerService.getFarmerById(id);
        return ResponseEntity.ok(ApiResponse.success(farmer));
    }

    @GetMapping("/code/{code}")
    public ResponseEntity<ApiResponse<FarmerResponse>> getFarmerByCode(@PathVariable String code) {
        FarmerResponse farmer = farmerService.getFarmerByCode(code);
        if (!SecurityUtils.canAccessFarmerData(farmer.getId())) {
            throw new AccessDeniedException("Access denied. You can only access your own farmer profile.");
        }
        return ResponseEntity.ok(ApiResponse.success(farmer));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<FarmerResponse>> createFarmer(@Valid @RequestBody FarmerCreateRequest request) {
        FarmerResponse farmer = farmerService.createFarmer(request);
        return new ResponseEntity<>(ApiResponse.success("Farmer profile created successfully", farmer), HttpStatus.CREATED);
    }
}
