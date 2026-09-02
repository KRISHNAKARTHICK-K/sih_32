package com.agriprocure.dto;

import com.agriprocure.entity.Role;
import java.time.Instant;
import java.util.UUID;

public class CentreStaffResponse {

    private UUID id;
    private UUID userId;
    private String username;
    private String fullName;
    private String email;
    private String mobile;
    private Role role;
    private String designation;
    private boolean active;
    private Instant createdAt;

    public CentreStaffResponse() {
    }

    public CentreStaffResponse(UUID id, UUID userId, String username, String fullName,
                               String email, String mobile, Role role, String designation,
                               boolean active, Instant createdAt) {
        this.id = id;
        this.userId = userId;
        this.username = username;
        this.fullName = fullName;
        this.email = email;
        this.mobile = mobile;
        this.role = role;
        this.designation = designation;
        this.active = active;
        this.createdAt = createdAt;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getMobile() {
        return mobile;
    }

    public void setMobile(String mobile) {
        this.mobile = mobile;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public String getDesignation() {
        return designation;
    }

    public void setDesignation(String designation) {
        this.designation = designation;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
