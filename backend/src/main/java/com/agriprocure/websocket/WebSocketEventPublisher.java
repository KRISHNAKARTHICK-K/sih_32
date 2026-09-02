package com.agriprocure.websocket;

import com.agriprocure.dto.RealtimeEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class WebSocketEventPublisher {

    private static final Logger log = LoggerFactory.getLogger(WebSocketEventPublisher.class);

    private final SimpMessagingTemplate messagingTemplate;

    public WebSocketEventPublisher(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public void publishToCentre(UUID centreId, String subtopic, RealtimeEvent event) {
        if (centreId == null) {
            return;
        }
        String destination = "/topic/centres/" + centreId + "/" + subtopic;
        try {
            messagingTemplate.convertAndSend(destination, event);
            log.debug("Published event [{}] to centre destination [{}]", event.getEventType(), destination);
        } catch (Exception e) {
            log.error("Failed to publish event to centre destination [{}]: {}", destination, e.getMessage());
        }
    }

    public void publishToUser(String username, String subqueue, RealtimeEvent event) {
        if (username == null || username.isBlank()) {
            return;
        }
        String destination = "/queue/" + subqueue;
        try {
            messagingTemplate.convertAndSendToUser(username, destination, event);
            log.debug("Published event [{}] to user [{}] queue [{}]", event.getEventType(), username, destination);
        } catch (Exception e) {
            log.error("Failed to publish event to user [{}] queue [{}]: {}", username, destination, e.getMessage());
        }
    }

    public void publishToAdmin(RealtimeEvent event) {
        String destination = "/topic/admin/operations";
        try {
            messagingTemplate.convertAndSend(destination, event);
            log.debug("Published event [{}] to admin destination [{}]", event.getEventType(), destination);
        } catch (Exception e) {
            log.error("Failed to publish event to admin destination: {}", e.getMessage());
        }
    }

    public void publishGlobal(String topic, RealtimeEvent event) {
        String destination = topic.startsWith("/topic") ? topic : "/topic/" + topic;
        try {
            messagingTemplate.convertAndSend(destination, event);
            log.debug("Published global event [{}] to destination [{}]", event.getEventType(), destination);
        } catch (Exception e) {
            log.error("Failed to publish global event to [{}]: {}", destination, e.getMessage());
        }
    }
}
