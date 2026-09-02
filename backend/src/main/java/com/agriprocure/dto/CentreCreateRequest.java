package com.agriprocure.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CentreCreateRequest {

    @NotBlank(message = "Centre name is required")
    @Size(min = 3, max = 150, message = "Centre name must be between 3 and 150 characters")
    private String name;

    private String address;

    @NotBlank(message = "Village/Town is required")
    private String village;

    @NotBlank(message = "District is required")
    private String district;

    @NotBlank(message = "State is required")
    private String state;

    private String contactNumber;

    public CentreCreateRequest() {
    }

    public CentreCreateRequest(String name, String address, String village, String district, String state, String contactNumber) {
        this.name = name;
        this.address = address;
        this.village = village;
        this.district = district;
        this.state = state;
        this.contactNumber = contactNumber;
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
}
