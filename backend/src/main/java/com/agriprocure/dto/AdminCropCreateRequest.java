package com.agriprocure.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class AdminCropCreateRequest {

    @NotBlank(message = "Crop code is required")
    @Size(max = 50, message = "Crop code must be at most 50 characters")
    private String code;

    @NotBlank(message = "Crop name is required")
    @Size(max = 100, message = "Crop name must be at most 100 characters")
    private String name;

    @NotBlank(message = "Unit is required")
    @Size(max = 20, message = "Unit must be at most 20 characters")
    private String unit = "QUINTAL";

    public AdminCropCreateRequest() {
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }
}
