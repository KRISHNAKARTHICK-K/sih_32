package com.agriprocure.service;

import com.agriprocure.entity.AuditLog;
import com.agriprocure.entity.User;
import com.agriprocure.repository.AuditLogRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public AuditLogService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logAction(User user, String action, String entityType, String entityId, String description) {
        try {
            AuditLog auditLog = new AuditLog(user, action, entityType, entityId, description);
            auditLogRepository.save(auditLog);
        } catch (Exception e) {
            // Logging failure should not break the business transaction
        }
    }
}
