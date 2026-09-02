package com.agriprocure.controller;

import com.agriprocure.dto.ApiResponse;
import com.agriprocure.dto.BookingCreateRequest;
import com.agriprocure.dto.BookingResponse;
import com.agriprocure.security.SecurityUtils;
import com.agriprocure.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping("/bookings")
    public ResponseEntity<ApiResponse<BookingResponse>> createBooking(@Valid @RequestBody BookingCreateRequest request) {
        if (SecurityUtils.isFarmer()) {
            UUID currentFarmerId = SecurityUtils.getCurrentFarmerId();
            if (currentFarmerId == null) {
                throw new AccessDeniedException("No farmer profile linked to the authenticated user");
            }
            // Backend forcefully enforces farmer identity from authenticated JWT
            request.setFarmerId(currentFarmerId);
        }

        BookingResponse booking = bookingService.createBooking(request);
        return new ResponseEntity<>(ApiResponse.success("Booking confirmed successfully", booking), HttpStatus.CREATED);
    }

    @GetMapping("/bookings/{id}")
    public ResponseEntity<ApiResponse<BookingResponse>> getBookingById(@PathVariable UUID id) {
        BookingResponse booking = bookingService.getBookingById(id);

        if (SecurityUtils.isFarmer() && !SecurityUtils.isSelfFarmer(booking.getFarmerId())) {
            throw new AccessDeniedException("Access denied. You cannot view another farmer's booking.");
        }

        if ((SecurityUtils.isOperator() || SecurityUtils.isCentreManager()) &&
                !SecurityUtils.isAssignedCentre(booking.getCentreId())) {
            throw new AccessDeniedException("Access denied. You cannot view bookings from another centre.");
        }

        return ResponseEntity.ok(ApiResponse.success(booking));
    }

    @GetMapping("/bookings/code/{code}")
    public ResponseEntity<ApiResponse<BookingResponse>> getBookingByCode(@PathVariable String code) {
        BookingResponse booking = bookingService.getBookingByCode(code);

        if (SecurityUtils.isFarmer() && !SecurityUtils.isSelfFarmer(booking.getFarmerId())) {
            throw new AccessDeniedException("Access denied. You cannot view another farmer's booking.");
        }

        if ((SecurityUtils.isOperator() || SecurityUtils.isCentreManager()) &&
                !SecurityUtils.isAssignedCentre(booking.getCentreId())) {
            throw new AccessDeniedException("Access denied. You cannot view bookings from another centre.");
        }

        return ResponseEntity.ok(ApiResponse.success(booking));
    }

    @GetMapping("/farmers/{farmerId}/bookings")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getBookingsByFarmer(@PathVariable UUID farmerId) {
        if (!SecurityUtils.canAccessFarmerData(farmerId)) {
            throw new AccessDeniedException("Access denied. You can only view your own bookings.");
        }
        List<BookingResponse> bookings = bookingService.getBookingsByFarmer(farmerId);
        return ResponseEntity.ok(ApiResponse.success("Farmer bookings retrieved", bookings));
    }

    @GetMapping("/centres/{centreId}/bookings")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('OPERATOR', 'CENTRE_MANAGER', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getBookingsByCentre(@PathVariable UUID centreId) {
        if (!SecurityUtils.canAccessCentreData(centreId)) {
            throw new AccessDeniedException("Access denied. You cannot view bookings for another centre.");
        }
        List<BookingResponse> bookings = bookingService.getBookingsByCentre(centreId);
        return ResponseEntity.ok(ApiResponse.success("Centre bookings retrieved", bookings));
    }
}
