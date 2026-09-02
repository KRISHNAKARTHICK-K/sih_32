package com.agriprocure.dto;

import java.time.Instant;
import java.util.UUID;

public class CentreResponse {

    private UUID id;
    private String centreCode;
    private String name;
    private String address;
    private String village;
    private String district;
    private String state;
    private String contactNumber;
    private boolean active;
    private Instant createdAt;

    public CentreResponse() {
    }

    public CentreResponse(UUID id, String centreCode, String name, String address, String village,
                          String district, String state, String contactNumber, boolean active, Instant createdAt) {
        this.id = id;
        this.centreCode = centreCode;
        this.name = name;
        this.address = address;
        this.village = village;
        this.district = district;
        this.state = state;
        this.contactNumber = contactNumber;
        this.active = active;
        this.createdAt = createdAt;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getCentreCode() {
        return centreCode;
    }

    public void setCentreCode(String centreCode) {
        this.centreCode = centreCode;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
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

    public String getContactNumber() {
        return contactNumber;
    }

    public void setContactNumber(String contactNumber) {
        this.contactNumber = contactNumber;
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
