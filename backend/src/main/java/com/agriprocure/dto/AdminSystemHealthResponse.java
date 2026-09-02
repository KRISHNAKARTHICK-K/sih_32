package com.agriprocure.dto;

import java.time.Instant;

public class AdminSystemHealthResponse {

    private String backendStatus;
    private String databaseStatus;
    private String databaseDialect;
    private int activeConnectionPool;
    private long jvmUsedMemoryMB;
    private long jvmMaxMemoryMB;
    private long jvmFreeMemoryMB;
    private long uptimeSeconds;
    private String environment;
    private Instant timestamp;

    public AdminSystemHealthResponse() {
    }

    public AdminSystemHealthResponse(String backendStatus, String databaseStatus, String databaseDialect,
                                     int activeConnectionPool, long jvmUsedMemoryMB, long jvmMaxMemoryMB,
                                     long jvmFreeMemoryMB, long uptimeSeconds, String environment, Instant timestamp) {
        this.backendStatus = backendStatus;
        this.databaseStatus = databaseStatus;
        this.databaseDialect = databaseDialect;
        this.activeConnectionPool = activeConnectionPool;
        this.jvmUsedMemoryMB = jvmUsedMemoryMB;
        this.jvmMaxMemoryMB = jvmMaxMemoryMB;
        this.jvmFreeMemoryMB = jvmFreeMemoryMB;
        this.uptimeSeconds = uptimeSeconds;
        this.environment = environment;
        this.timestamp = timestamp;
    }

    public String getBackendStatus() {
        return backendStatus;
    }

    public void setBackendStatus(String backendStatus) {
        this.backendStatus = backendStatus;
    }

    public String getDatabaseStatus() {
        return databaseStatus;
    }

    public void setDatabaseStatus(String databaseStatus) {
        this.databaseStatus = databaseStatus;
    }

    public String getDatabaseDialect() {
        return databaseDialect;
    }

    public void setDatabaseDialect(String databaseDialect) {
        this.databaseDialect = databaseDialect;
    }

    public int getActiveConnectionPool() {
        return activeConnectionPool;
    }

    public void setActiveConnectionPool(int activeConnectionPool) {
        this.activeConnectionPool = activeConnectionPool;
    }

    public long getJvmUsedMemoryMB() {
        return jvmUsedMemoryMB;
    }

    public void setJvmUsedMemoryMB(long jvmUsedMemoryMB) {
        this.jvmUsedMemoryMB = jvmUsedMemoryMB;
    }

    public long getJvmMaxMemoryMB() {
        return jvmMaxMemoryMB;
    }

    public void setJvmMaxMemoryMB(long jvmMaxMemoryMB) {
        this.jvmMaxMemoryMB = jvmMaxMemoryMB;
    }

    public long getJvmFreeMemoryMB() {
        return jvmFreeMemoryMB;
    }

    public void setJvmFreeMemoryMB(long jvmFreeMemoryMB) {
        this.jvmFreeMemoryMB = jvmFreeMemoryMB;
    }

    public long getUptimeSeconds() {
        return uptimeSeconds;
    }

    public void setUptimeSeconds(long uptimeSeconds) {
        this.uptimeSeconds = uptimeSeconds;
    }

    public String getEnvironment() {
        return environment;
    }

    public void setEnvironment(String environment) {
        this.environment = environment;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Instant timestamp) {
        this.timestamp = timestamp;
    }
}
