package com.agriprocure.controller;

import com.agriprocure.dto.ApiResponse;
import com.agriprocure.dto.AuthenticatedUserResponse;
import com.agriprocure.dto.LoginRequest;
import com.agriprocure.dto.LoginResponse;
import com.agriprocure.security.CustomUserDetails;
import com.agriprocure.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Authentication successful", response));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<AuthenticatedUserResponse>> getMe(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        AuthenticatedUserResponse user = authService.getMe(userDetails);
        return ResponseEntity.ok(ApiResponse.success("Authenticated user profile retrieved", user));
    }
}
