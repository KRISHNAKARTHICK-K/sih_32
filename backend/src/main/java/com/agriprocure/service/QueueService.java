package com.agriprocure.service;

import com.agriprocure.dto.QueueOverviewResponse;
import com.agriprocure.dto.QueueStatusUpdateRequest;
import com.agriprocure.dto.QueueTokenResponse;
import com.agriprocure.entity.*;
import com.agriprocure.exception.InvalidStateTransitionException;
import com.agriprocure.exception.ResourceNotFoundException;
import com.agriprocure.repository.ProcurementCentreRepository;
import com.agriprocure.repository.QueueTokenRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class QueueService {

    private final QueueTokenRepository queueTokenRepository;
    private final ProcurementCentreRepository centreRepository;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;
    private final com.agriprocure.websocket.WebSocketEventPublisher eventPublisher;

    private static final List<QueueStatus> ACTIVE_STATUSES = List.of(
            QueueStatus.BOOKED,
            QueueStatus.ARRIVED,
            QueueStatus.VERIFIED,
            QueueStatus.WAITING,
            QueueStatus.PROCESSING,
            QueueStatus.WEIGHING,
            QueueStatus.QUALITY_CHECK
    );

    public QueueService(QueueTokenRepository queueTokenRepository,
                        ProcurementCentreRepository centreRepository,
                        NotificationService notificationService,
                        AuditLogService auditLogService,
                        com.agriprocure.websocket.WebSocketEventPublisher eventPublisher) {
        this.queueTokenRepository = queueTokenRepository;
        this.centreRepository = centreRepository;
        this.notificationService = notificationService;
        this.auditLogService = auditLogService;
        this.eventPublisher = eventPublisher;
    }

    public QueueToken generateToken(Booking booking) {
        Slot slot = booking.getSlot();
        ProcurementCentre centre = slot.getCentre();
        LocalDate queueDate = slot.getSlotDate();

        // Sequential token calculation scoped to centre and date
        int nextTokenNumber = queueTokenRepository.findTopByCentreIdAndQueueDateOrderByTokenNumberDesc(centre.getId(), queueDate)
                .map(t -> t.getTokenNumber() + 1)
                .orElse(1);

        String displayToken = String.format("A-%03d", nextTokenNumber);

        QueueToken token = new QueueToken(
                nextTokenNumber,
                displayToken,
                booking,
                booking.getFarmer(),
                centre,
                queueDate,
                QueueStatus.BOOKED,
                nextTokenNumber
        );

        QueueToken savedToken = queueTokenRepository.save(token);

        notificationService.sendNotification(
                booking.getFarmer().getUser(),
                "Queue Token Generated: " + displayToken,
                "Your slot booking is confirmed. Display Token " + displayToken + " generated for " + queueDate + " at " + centre.getName(),
                NotificationType.QUEUE
        );

        QueueTokenResponse tokenResponse = mapToResponse(savedToken);
        com.agriprocure.dto.RealtimeEvent event = new com.agriprocure.dto.RealtimeEvent(
                com.agriprocure.dto.RealtimeEventType.QUEUE_UPDATED,
                centre.getId(),
                "QUEUE_TOKEN",
                savedToken.getId().toString(),
                tokenResponse
        );
        eventPublisher.publishToCentre(centre.getId(), "queue", event);
        eventPublisher.publishToAdmin(event);

        return savedToken;
    }

    @Transactional(readOnly = true)
    public QueueOverviewResponse getQueueOverview(UUID centreId, LocalDate date) {
        LocalDate queueDate = (date != null) ? date : LocalDate.now();
        ProcurementCentre centre = centreRepository.findById(centreId)
                .orElseThrow(() -> new ResourceNotFoundException("Centre not found with ID: " + centreId));

        List<QueueToken> allTokens = queueTokenRepository.findByCentreIdAndQueueDateOrderByTokenNumberAsc(centreId, queueDate);

        List<QueueStatus> servingStatuses = List.of(
                QueueStatus.PROCESSING,
                QueueStatus.WEIGHING,
                QueueStatus.QUALITY_CHECK
        );
        Optional<QueueToken> currentActive = queueTokenRepository.findCurrentActiveToken(centreId, queueDate, servingStatuses);
        if (currentActive.isEmpty()) {
            currentActive = queueTokenRepository.findCurrentActiveToken(centreId, queueDate, ACTIVE_STATUSES);
        }

        long waitingCount = allTokens.stream().filter(t -> t.getStatus() == QueueStatus.WAITING || t.getStatus() == QueueStatus.ARRIVED || t.getStatus() == QueueStatus.BOOKED).count();
        long processingCount = allTokens.stream().filter(t -> t.getStatus() == QueueStatus.PROCESSING || t.getStatus() == QueueStatus.WEIGHING || t.getStatus() == QueueStatus.QUALITY_CHECK).count();
        long completedCount = allTokens.stream().filter(t -> t.getStatus() == QueueStatus.COMPLETED || t.getStatus() == QueueStatus.APPROVED).count();

        QueueOverviewResponse response = new QueueOverviewResponse();
        response.setCentreId(centre.getId());
        response.setCentreName(centre.getName());
        response.setQueueDate(queueDate);
        response.setCurrentServingToken(currentActive.map(QueueToken::getDisplayToken).orElse("None"));
        response.setTotalTokens(allTokens.size());
        response.setWaitingCount(waitingCount);
        response.setProcessingCount(processingCount);
        response.setCompletedCount(completedCount);
        response.setActiveTokens(allTokens.stream().map(this::mapToResponse).collect(Collectors.toList()));

        return response;
    }

    @Transactional(readOnly = true)
    public List<QueueTokenResponse> getFarmerQueueTokens(UUID farmerId) {
        return queueTokenRepository.findByFarmerIdOrderByCreatedAtDesc(farmerId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public QueueTokenResponse getTokenById(UUID id) {
        QueueToken token = queueTokenRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Queue Token not found with ID: " + id));
        return mapToResponse(token);
    }

    public QueueTokenResponse updateTokenStatus(UUID id, QueueStatusUpdateRequest request) {
        QueueToken token = queueTokenRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Queue Token not found with ID: " + id));

        QueueStatus current = token.getStatus();
        QueueStatus next = request.getStatus();

        if (current == QueueStatus.COMPLETED || current == QueueStatus.CANCELLED) {
            throw new InvalidStateTransitionException("Cannot change status of a " + current + " token");
        }

        token.setStatus(next);
        QueueToken saved = queueTokenRepository.save(token);

        auditLogService.logAction(
                token.getFarmer().getUser(),
                "UPDATE_QUEUE_STATUS",
                "QUEUE_TOKEN",
                saved.getId().toString(),
                "Queue token " + saved.getDisplayToken() + " status transitioned from " + current + " to " + next
        );

        QueueTokenResponse tokenResponse = mapToResponse(saved);
        com.agriprocure.dto.RealtimeEvent event = new com.agriprocure.dto.RealtimeEvent(
                com.agriprocure.dto.RealtimeEventType.TOKEN_UPDATED,
                token.getCentre().getId(),
                "QUEUE_TOKEN",
                saved.getId().toString(),
                tokenResponse
        );
        eventPublisher.publishToCentre(token.getCentre().getId(), "queue", event);
        eventPublisher.publishToAdmin(event);

        return tokenResponse;
    }

    public QueueTokenResponse callNextWaitingToken(UUID centreId, LocalDate date) {
        LocalDate queueDate = (date != null) ? date : LocalDate.now();
        List<QueueStatus> waitingStatuses = List.of(
                QueueStatus.WAITING,
                QueueStatus.VERIFIED,
                QueueStatus.ARRIVED,
                QueueStatus.BOOKED
        );

        Optional<QueueToken> nextTokenOpt = queueTokenRepository.findNextWaitingTokenWithLock(
                centreId,
                queueDate,
                waitingStatuses
        );

        if (nextTokenOpt.isEmpty()) {
            throw new ResourceNotFoundException("No waiting farmers in queue for this centre today.");
        }

        QueueToken token = nextTokenOpt.get();
        token.setStatus(QueueStatus.PROCESSING);
        QueueToken saved = queueTokenRepository.save(token);

        notificationService.sendNotification(
                token.getFarmer().getUser(),
                "Token Called: " + saved.getDisplayToken(),
                "Your token " + saved.getDisplayToken() + " is now being served at the intake gate / weighbridge.",
                NotificationType.QUEUE
        );

        auditLogService.logAction(
                token.getFarmer().getUser(),
                "CALL_NEXT_TOKEN",
                "QUEUE_TOKEN",
                saved.getId().toString(),
                "Operator called next waiting token: " + saved.getDisplayToken()
        );

        QueueTokenResponse tokenResponse = mapToResponse(saved);
        com.agriprocure.dto.RealtimeEvent event = new com.agriprocure.dto.RealtimeEvent(
                com.agriprocure.dto.RealtimeEventType.TOKEN_CALLED,
                centreId,
                "QUEUE_TOKEN",
                saved.getId().toString(),
                tokenResponse
        );
        eventPublisher.publishToCentre(centreId, "queue", event);
        eventPublisher.publishToAdmin(event);

        return tokenResponse;
    }

    public QueueTokenResponse mapToResponse(QueueToken token) {
        long peopleAhead = 0;
        if (ACTIVE_STATUSES.contains(token.getStatus())) {
            peopleAhead = queueTokenRepository.countPeopleAhead(
                    token.getCentre().getId(),
                    token.getQueueDate(),
                    token.getTokenNumber(),
                    ACTIVE_STATUSES
            );
        }

        QueueTokenResponse response = new QueueTokenResponse();
        response.setId(token.getId());
        response.setTokenNumber(token.getTokenNumber());
        response.setDisplayToken(token.getDisplayToken());
        response.setBookingId(token.getBooking().getId());
        response.setBookingCode(token.getBooking().getBookingCode());
        response.setFarmerId(token.getFarmer().getId());
        response.setFarmerName(token.getFarmer().getFullName());
        response.setFarmerCode(token.getFarmer().getFarmerCode());
        response.setFarmerMobile(token.getFarmer().getMobile());
        response.setCentreId(token.getCentre().getId());
        response.setCentreName(token.getCentre().getName());
        response.setCentreCode(token.getCentre().getCentreCode());
        response.setQueueDate(token.getQueueDate());
        response.setStatus(token.getStatus());
        response.setQueuePosition(token.getQueuePosition());
        response.setPeopleAhead(peopleAhead);
        response.setCreatedAt(token.getCreatedAt());
        return response;
    }
}
