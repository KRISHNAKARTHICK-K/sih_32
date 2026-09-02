package com.agriprocure.dto;

import java.time.Instant;
import java.util.UUID;

public class AdminUserResponse {

    private UUID id;
    private String username;
    private String fullName;
    private String email;
    private String mobile;
    private String role;
    private boolean enabled;
    private Instant createdAt;

    // Associated Metadata
    private UUID centreId;
    private String centreName;
    private String designation;
    private UUID farmerId;
    private String farmerCode;

    public AdminUserResponse() {
    }

    public AdminUserResponse(UUID id, String username, String fullName, String email, String mobile,
                             String role, boolean enabled, Instant createdAt, UUID centreId,
                             String centreName, String designation, UUID farmerId, String farmerCode) {
        this.id = id;
        this.username = username;
        this.fullName = fullName;
        this.email = email;
        this.mobile = mobile;
        this.role = role;
        this.enabled = enabled;
        this.createdAt = createdAt;
        this.centreId = centreId;
        this.centreName = centreName;
        this.designation = designation;
        this.farmerId = farmerId;
        this.farmerCode = farmerCode;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
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

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public boolean isActive() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public void setActive(boolean active) {
        this.enabled = active;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public UUID getCentreId() {
        return centreId;
    }

    public void setCentreId(UUID centreId) {
        this.centreId = centreId;
    }

    public String getCentreName() {
        return centreName;
    }

    public void setCentreName(String centreName) {
        this.centreName = centreName;
    }

    public String getDesignation() {
        return designation;
    }

    public void setDesignation(String designation) {
        this.designation = designation;
    }

    public UUID getFarmerId() {
        return farmerId;
    }

    public void setFarmerId(UUID farmerId) {
        this.farmerId = farmerId;
    }

    public String getFarmerCode() {
        return farmerCode;
    }

    public void setFarmerCode(String farmerCode) {
        this.farmerCode = farmerCode;
    }
}
