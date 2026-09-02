package com.agriprocure.controller;

import com.agriprocure.dto.ApiResponse;
import com.agriprocure.dto.CentreStaffResponse;
import com.agriprocure.dto.ManagerDashboardResponse;
import com.agriprocure.dto.ManagerReportsResponse;
import com.agriprocure.security.SecurityUtils;
import com.agriprocure.service.ManagerService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/manager")
@PreAuthorize("hasAnyRole('CENTRE_MANAGER', 'ADMIN')")
public class ManagerController {

    private final ManagerService managerService;

    public ManagerController(ManagerService managerService) {
        this.managerService = managerService;
    }

    private UUID resolveCentreId(UUID explicitCentreId) {
        if (explicitCentreId != null) {
            if (!SecurityUtils.canAccessCentreData(explicitCentreId)) {
                throw new AccessDeniedException("Access denied. You cannot access operations for another procurement centre.");
            }
            return explicitCentreId;
        }

        UUID userCentreId = SecurityUtils.getCurrentCentreId();
        if (userCentreId != null) {
            return userCentreId;
        }

        throw new AccessDeniedException("No procurement centre is assigned to your account session.");
    }

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<ManagerDashboardResponse>> getDashboard(
            @RequestParam(required = false) UUID centreId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        UUID effectiveCentreId = resolveCentreId(centreId);
        ManagerDashboardResponse dashboard = managerService.getDashboard(effectiveCentreId, date);
        return ResponseEntity.ok(ApiResponse.success("Manager dashboard loaded successfully", dashboard));
    }

    @GetMapping("/staff")
    public ResponseEntity<ApiResponse<List<CentreStaffResponse>>> getStaff(
            @RequestParam(required = false) UUID centreId) {
        UUID effectiveCentreId = resolveCentreId(centreId);
        List<CentreStaffResponse> staff = managerService.getCentreStaff(effectiveCentreId);
        return ResponseEntity.ok(ApiResponse.success("Centre staff directory retrieved", staff));
    }

    @GetMapping("/reports")
    public ResponseEntity<ApiResponse<ManagerReportsResponse>> getReports(
            @RequestParam(required = false) UUID centreId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {
        UUID effectiveCentreId = resolveCentreId(centreId);
        ManagerReportsResponse reports = managerService.getReports(effectiveCentreId, fromDate, toDate);
        return ResponseEntity.ok(ApiResponse.success("Operational reports generated successfully", reports));
    }
}
