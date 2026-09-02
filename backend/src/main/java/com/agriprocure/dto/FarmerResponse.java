package com.agriprocure.dto;

import java.time.Instant;
import java.util.UUID;

public class FarmerResponse {

    private UUID id;
    private String farmerCode;
    private String fullName;
    private String mobile;
    private String email;
    private String village;
    private String district;
    private String state;
    private String address;
    private Instant createdAt;

    public FarmerResponse() {
    }

    public FarmerResponse(UUID id, String farmerCode, String fullName, String mobile, String email,
                          String village, String district, String state, String address, Instant createdAt) {
        this.id = id;
        this.farmerCode = farmerCode;
        this.fullName = fullName;
        this.mobile = mobile;
        this.email = email;
        this.village = village;
        this.district = district;
        this.state = state;
        this.address = address;
        this.createdAt = createdAt;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getFarmerCode() {
        return farmerCode;
    }

    public void setFarmerCode(String farmerCode) {
        this.farmerCode = farmerCode;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getMobile() {
        return mobile;
    }

    public void setMobile(String mobile) {
        this.mobile = mobile;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getVillage() {
        return village;
    }

    public void setVillage(String village) {
        this.village = village;
    }

    public String getDistrict() {
        return district;
    }

    public void setDistrict(String district) {
        this.district = district;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
