package com.agriprocure.websocket;

import com.agriprocure.dto.RealtimeEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.util.UUID;

@Service
public class WebSocketEventPublisher {

    private static final Logger log = LoggerFactory.getLogger(WebSocketEventPublisher.class);

    private final SimpMessagingTemplate messagingTemplate;
    private final java.util.List<RealtimeEvent> recentPublishedEvents = new java.util.concurrent.CopyOnWriteArrayList<>();

    public WebSocketEventPublisher(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public java.util.List<RealtimeEvent> getRecentPublishedEvents() {
        return java.util.Collections.unmodifiableList(recentPublishedEvents);
    }

    public void clearRecentPublishedEvents() {
        recentPublishedEvents.clear();
    }

    private void recordEvent(RealtimeEvent event) {
        if (event != null) {
            if (recentPublishedEvents.size() > 200) {
                recentPublishedEvents.remove(0);
            }
            recentPublishedEvents.add(event);
        }
    }

    private void executeAfterCommitOrImmediately(Runnable action) {
        if (TransactionSynchronizationManager.isActualTransactionActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    action.run();
                }
            });
        } else {
            action.run();
        }
    }

    public void publishToCentre(UUID centreId, String subtopic, RealtimeEvent event) {
        if (centreId == null) {
            return;
        }
        String destination = "/topic/centres/" + centreId + "/" + subtopic;
        executeAfterCommitOrImmediately(() -> {
            recordEvent(event);
            try {
                messagingTemplate.convertAndSend(destination, event);
                log.info("Published event [{}] to centre destination [{}] (Entity: {}/{})",
                        event.getEventType(), destination, event.getEntityType(), event.getEntityId());
            } catch (Exception e) {
                log.error("Failed to publish event to centre destination [{}]: {}", destination, e.getMessage());
            }
        });
    }

    public void publishToUser(String username, String subqueue, RealtimeEvent event) {
        if (username == null || username.isBlank()) {
            return;
        }
        String destination = "/queue/" + subqueue;
        executeAfterCommitOrImmediately(() -> {
            recordEvent(event);
            try {
                messagingTemplate.convertAndSendToUser(username, destination, event);
                log.info("Published event [{}] to user [{}] queue [{}] (Entity: {}/{})",
                        event.getEventType(), username, destination, event.getEntityType(), event.getEntityId());
            } catch (Exception e) {
                log.error("Failed to publish event to user [{}] queue [{}]: {}", username, destination, e.getMessage());
            }
        });
    }

    public void publishToAdmin(RealtimeEvent event) {
        String destination = "/topic/admin/operations";
        executeAfterCommitOrImmediately(() -> {
            recordEvent(event);
            try {
                messagingTemplate.convertAndSend(destination, event);
                log.info("Published event [{}] to admin destination [{}] (Entity: {}/{})",
                        event.getEventType(), destination, event.getEntityType(), event.getEntityId());
            } catch (Exception e) {
                log.error("Failed to publish event to admin destination: {}", e.getMessage());
            }
        });
    }

    public void publishGlobal(String topic, RealtimeEvent event) {
        String destination = topic.startsWith("/topic") ? topic : "/topic/" + topic;
        executeAfterCommitOrImmediately(() -> {
            recordEvent(event);
            try {
                messagingTemplate.convertAndSend(destination, event);
                log.info("Published global event [{}] to destination [{}] (Entity: {}/{})",
                        event.getEventType(), destination, event.getEntityType(), event.getEntityId());
            } catch (Exception e) {
                log.error("Failed to publish global event to [{}]: {}", destination, e.getMessage());
            }
        });
    }
}
