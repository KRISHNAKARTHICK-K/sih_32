package com.agriprocure.dto;

import com.agriprocure.entity.Role;

import java.util.UUID;

public class AuthenticatedUserResponse {

    private UUID id;
    private String username;
    private String email;
    private String mobile;
    private Role role;
    private String fullName;
    private UUID farmerId;
    private String farmerCode;
    private UUID centreId;
    private String centreName;
    private String centreCode;

    public AuthenticatedUserResponse() {
    }

    public AuthenticatedUserResponse(UUID id, String username, String email, String mobile, Role role,
                                     String fullName, UUID farmerId, String farmerCode, UUID centreId,
                                     String centreName, String centreCode) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.mobile = mobile;
        this.role = role;
        this.fullName = fullName;
        this.farmerId = farmerId;
        this.farmerCode = farmerCode;
        this.centreId = centreId;
        this.centreName = centreName;
        this.centreCode = centreCode;
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

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
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

    public String getCentreCode() {
        return centreCode;
    }

    public void setCentreCode(String centreCode) {
        this.centreCode = centreCode;
    }
}
