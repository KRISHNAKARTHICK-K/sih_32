package com.agriprocure.controller;

import com.agriprocure.dto.*;
import com.agriprocure.service.AdminService;
import com.agriprocure.service.FarmerService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;
    private final FarmerService farmerService;

    public AdminController(AdminService adminService, FarmerService farmerService) {
        this.adminService = adminService;
        this.farmerService = farmerService;
    }

    // ==========================================
    // 1. DASHBOARD
    // ==========================================
    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<AdminDashboardResponse>> getDashboard() {
        AdminDashboardResponse dashboard = adminService.getDashboard();
        return ResponseEntity.ok(ApiResponse.success("Admin dashboard overview retrieved", dashboard));
    }

    // ==========================================
    // 2. USERS
    // ==========================================
    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<AdminUserResponse>>> getAllUsers() {
        List<AdminUserResponse> users = adminService.getAllUsers();
        return ResponseEntity.ok(ApiResponse.success("Users retrieved successfully", users));
    }

    @PostMapping("/users")
    public ResponseEntity<ApiResponse<AdminUserResponse>> createUser(@Valid @RequestBody AdminUserCreateRequest request) {
        AdminUserResponse user = adminService.createUser(request);
        return new ResponseEntity<>(ApiResponse.success("User created successfully", user), HttpStatus.CREATED);
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<ApiResponse<AdminUserResponse>> updateUser(
            @PathVariable UUID id,
            @RequestBody AdminUserUpdateRequest request) {
        AdminUserResponse user = adminService.updateUser(id, request);
        return ResponseEntity.ok(ApiResponse.success("User updated successfully", user));
    }

    @PatchMapping("/users/{id}/status")
    public ResponseEntity<ApiResponse<AdminUserResponse>> updateUserStatus(
            @PathVariable UUID id,
            @RequestParam(required = false) Boolean active,
            @RequestParam(required = false) Boolean enabled) {
        boolean targetStatus = active != null ? active : (enabled != null ? enabled : true);
        AdminUserResponse user = adminService.updateUserStatus(id, targetStatus);
        return ResponseEntity.ok(ApiResponse.success("User status updated", user));
    }

    // ==========================================
    // 3. FARMERS
    // ==========================================
    @GetMapping("/farmers")
    public ResponseEntity<ApiResponse<List<FarmerResponse>>> getAllFarmers() {
        List<FarmerResponse> farmers = farmerService.getAllFarmers();
        return ResponseEntity.ok(ApiResponse.success("Farmers retrieved successfully", farmers));
    }

    // ==========================================
    // 4. CENTRES
    // ==========================================
    @GetMapping("/centres")
    public ResponseEntity<ApiResponse<List<AdminCentreSummaryResponse>>> getAllCentres() {
        List<AdminCentreSummaryResponse> centres = adminService.getAllCentres();
        return ResponseEntity.ok(ApiResponse.success("Procurement centres retrieved", centres));
    }

    @PostMapping("/centres")
    public ResponseEntity<ApiResponse<CentreResponse>> createCentre(@Valid @RequestBody CentreCreateRequest request) {
        CentreResponse centre = adminService.createCentre(request);
        return new ResponseEntity<>(ApiResponse.success("Procurement centre created", centre), HttpStatus.CREATED);
    }

    @PutMapping("/centres/{id}")
    public ResponseEntity<ApiResponse<CentreResponse>> updateCentre(
            @PathVariable UUID id,
            @RequestBody AdminCentreUpdateRequest request) {
        CentreResponse centre = adminService.updateCentre(id, request);
        return ResponseEntity.ok(ApiResponse.success("Procurement centre updated", centre));
    }

    @PatchMapping("/centres/{id}/status")
    public ResponseEntity<ApiResponse<CentreResponse>> updateCentreStatus(
            @PathVariable UUID id,
            @RequestParam(required = false) Boolean active,
            @RequestParam(required = false) Boolean enabled) {
        boolean targetStatus = active != null ? active : (enabled != null ? enabled : true);
        CentreResponse centre = adminService.updateCentreStatus(id, targetStatus);
        return ResponseEntity.ok(ApiResponse.success("Procurement centre status updated", centre));
    }

    // ==========================================
    // 5. CROPS & MSP PRICES
    // ==========================================
    @GetMapping("/crops")
    public ResponseEntity<ApiResponse<List<CropResponse>>> getAllCrops(
            @RequestParam(required = false, defaultValue = "false") boolean activeOnly) {
        List<CropResponse> crops = adminService.getAllCrops(activeOnly);
        return ResponseEntity.ok(ApiResponse.success("Crops retrieved successfully", crops));
    }

    @PostMapping("/crops")
    public ResponseEntity<ApiResponse<CropResponse>> createCrop(@Valid @RequestBody AdminCropCreateRequest request) {
        CropResponse crop = adminService.createCrop(request);
        return new ResponseEntity<>(ApiResponse.success("Crop created successfully", crop), HttpStatus.CREATED);
    }

    @PutMapping("/crops/{id}")
    public ResponseEntity<ApiResponse<CropResponse>> updateCrop(
            @PathVariable UUID id,
            @RequestBody AdminCropUpdateRequest request) {
        CropResponse crop = adminService.updateCrop(id, request);
        return ResponseEntity.ok(ApiResponse.success("Crop updated successfully", crop));
    }

    @PatchMapping("/crops/{id}/status")
    public ResponseEntity<ApiResponse<CropResponse>> updateCropStatus(
            @PathVariable UUID id,
            @RequestParam(required = false) Boolean active,
            @RequestParam(required = false) Boolean enabled) {
        boolean targetStatus = active != null ? active : (enabled != null ? enabled : true);
        CropResponse crop = adminService.updateCropStatus(id, targetStatus);
        return ResponseEntity.ok(ApiResponse.success("Crop status updated", crop));
    }

    @GetMapping("/prices")
    public ResponseEntity<ApiResponse<List<CropPriceResponse>>> getAllPrices() {
        List<CropPriceResponse> prices = adminService.getAllPrices();
        return ResponseEntity.ok(ApiResponse.success("Crop price master data retrieved", prices));
    }

    @PostMapping("/prices")
    public ResponseEntity<ApiResponse<CropPriceResponse>> createPrice(@Valid @RequestBody AdminCropPriceCreateRequest request) {
        CropPriceResponse price = adminService.createCropPrice(request);
        return new ResponseEntity<>(ApiResponse.success("Crop price configured successfully", price), HttpStatus.CREATED);
    }

    @PatchMapping("/prices/{id}/status")
    public ResponseEntity<ApiResponse<CropPriceResponse>> updatePriceStatus(
            @PathVariable UUID id,
            @RequestParam(required = false) Boolean active,
            @RequestParam(required = false) Boolean enabled) {
        boolean targetStatus = active != null ? active : (enabled != null ? enabled : true);
        CropPriceResponse price = adminService.updateCropPriceStatus(id, targetStatus);
        return ResponseEntity.ok(ApiResponse.success("Crop price status updated", price));
    }

    // ==========================================
    // 6. REGISTRIES (Bookings, Procurements, Payments)
    // ==========================================
    @GetMapping({"/bookings", "/booking"})
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getAllBookings() {
        List<BookingResponse> bookings = adminService.getAllBookings();
        return ResponseEntity.ok(ApiResponse.success("System-wide bookings retrieved", bookings));
    }

    @GetMapping({"/procurements", "/procurement"})
    public ResponseEntity<ApiResponse<List<ProcurementResponse>>> getAllProcurements() {
        List<ProcurementResponse> procurements = adminService.getAllProcurements();
        return ResponseEntity.ok(ApiResponse.success("System-wide procurements retrieved", procurements));
    }

    @GetMapping({"/payments", "/payment"})
    public ResponseEntity<ApiResponse<List<PaymentResponse>>> getAllPayments() {
        List<PaymentResponse> payments = adminService.getAllPayments();
        return ResponseEntity.ok(ApiResponse.success("System-wide payments retrieved", payments));
    }

    // ==========================================
    // 7. AUDIT LOGS
    // ==========================================
    @GetMapping({"/audit", "/audit-logs"})
    public ResponseEntity<ApiResponse<List<AdminAuditLogResponse>>> getAuditLogs(
            @RequestParam(required = false) String action,
            @RequestParam(required = false) String entityType,
            @RequestParam(required = false) String username,
            @RequestParam(required = false, defaultValue = "200") Integer limit) {
        List<AdminAuditLogResponse> logs = adminService.getAuditLogs(action, entityType, username, limit);
        return ResponseEntity.ok(ApiResponse.success("Audit logs retrieved", logs));
    }

    // ==========================================
    // 8. SYSTEM HEALTH
    // ==========================================
    @GetMapping({"/system/health", "/system-health"})
    public ResponseEntity<ApiResponse<AdminSystemHealthResponse>> getSystemHealth() {
        AdminSystemHealthResponse health = adminService.getSystemHealth();
        return ResponseEntity.ok(ApiResponse.success("System health metrics retrieved", health));
    }
}
