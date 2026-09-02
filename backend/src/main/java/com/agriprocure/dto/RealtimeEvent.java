package com.agriprocure.dto;

import java.time.Instant;
import java.util.UUID;

public class RealtimeEvent {

    private UUID eventId;
    private RealtimeEventType eventType;
    private UUID centreId;
    private String entityType;
    private String entityId;
    private Instant timestamp;
    private Object payload;

    public RealtimeEvent() {
        this.eventId = UUID.randomUUID();
        this.timestamp = Instant.now();
    }

    public RealtimeEvent(RealtimeEventType eventType, UUID centreId, String entityType, String entityId, Object payload) {
        this.eventId = UUID.randomUUID();
        this.eventType = eventType;
        this.centreId = centreId;
        this.entityType = entityType;
        this.entityId = entityId;
        this.timestamp = Instant.now();
        this.payload = payload;
    }

    public UUID getEventId() {
        return eventId;
    }

    public void setEventId(UUID eventId) {
        this.eventId = eventId;
    }

    public RealtimeEventType getEventType() {
        return eventType;
    }

    public void setEventType(RealtimeEventType eventType) {
        this.eventType = eventType;
    }

    public UUID getCentreId() {
        return centreId;
    }

    public void setCentreId(UUID centreId) {
        this.centreId = centreId;
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

    public Instant getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Instant timestamp) {
        this.timestamp = timestamp;
    }

    public Object getPayload() {
        return payload;
    }

    public void setPayload(Object payload) {
        this.payload = payload;
    }
}
