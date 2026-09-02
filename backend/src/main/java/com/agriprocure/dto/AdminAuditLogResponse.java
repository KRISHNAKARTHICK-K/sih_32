package com.agriprocure.dto;

import java.time.Instant;
import java.util.UUID;

public class AdminAuditLogResponse {

    private UUID id;
    private Instant timestamp;
    private String username;
    private String userFullName;
    private String userRole;
    private String action;
    private String entityType;
    private String entityId;
    private String description;

    public AdminAuditLogResponse() {
    }

    public AdminAuditLogResponse(UUID id, Instant timestamp, String username, String userFullName,
                                 String userRole, String action, String entityType, String entityId,
                                 String description) {
        this.id = id;
        this.timestamp = timestamp;
        this.username = username;
        this.userFullName = userFullName;
        this.userRole = userRole;
        this.action = action;
        this.entityType = entityType;
        this.entityId = entityId;
        this.description = description;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Instant timestamp) {
        this.timestamp = timestamp;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getUserFullName() {
        return userFullName;
    }

    public void setUserFullName(String userFullName) {
        this.userFullName = userFullName;
    }

    public String getUserRole() {
        return userRole;
    }

    public void setUserRole(String userRole) {
        this.userRole = userRole;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public String getEntityType() {
        return entityType;
    }

    public void setEntityType(String entityType) {
        this.entityType = entityType;
    }

    public String getEntityId() {
        return entityId;
    }

    public void setEntityId(String entityId) {
        this.entityId = entityId;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
