package com.agriprocure.controller;

import com.agriprocure.dto.ApiResponse;
import com.agriprocure.dto.CentreCreateRequest;
import com.agriprocure.dto.CentreResponse;
import com.agriprocure.service.CentreService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/centres")
public class CentreController {

    private final CentreService centreService;

    public CentreController(CentreService centreService) {
        this.centreService = centreService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<CentreResponse>>> getAllCentres(
            @RequestParam(required = false, defaultValue = "false") boolean activeOnly) {
        List<CentreResponse> centres = activeOnly ? centreService.getActiveCentres() : centreService.getAllCentres();
        return ResponseEntity.ok(ApiResponse.success("Centres retrieved successfully", centres));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CentreResponse>> getCentreById(@PathVariable UUID id) {
        CentreResponse centre = centreService.getCentreById(id);
        return ResponseEntity.ok(ApiResponse.success(centre));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CentreResponse>> createCentre(@Valid @RequestBody CentreCreateRequest request) {
        CentreResponse centre = centreService.createCentre(request);
        return new ResponseEntity<>(ApiResponse.success("Procurement centre created successfully", centre), HttpStatus.CREATED);
    }
}
