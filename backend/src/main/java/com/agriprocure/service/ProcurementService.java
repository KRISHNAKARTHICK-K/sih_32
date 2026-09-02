package com.agriprocure.service;

import com.agriprocure.dto.*;
import com.agriprocure.entity.*;
import com.agriprocure.exception.InvalidStateTransitionException;
import com.agriprocure.exception.ResourceNotFoundException;
import com.agriprocure.exception.ValidationException;
import com.agriprocure.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.Year;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class ProcurementService {

    private final ProcurementRepository procurementRepository;
    private final FarmerRepository farmerRepository;
    private final CropRepository cropRepository;
    private final CropPriceRepository cropPriceRepository;
    private final QueueTokenRepository queueTokenRepository;
    private final WeighmentRepository weighmentRepository;
    private final QualityInspectionRepository qualityInspectionRepository;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;
    private final com.agriprocure.websocket.WebSocketEventPublisher eventPublisher;

    public ProcurementService(ProcurementRepository procurementRepository,
                              FarmerRepository farmerRepository,
                              CropRepository cropRepository,
                              CropPriceRepository cropPriceRepository,
                              QueueTokenRepository queueTokenRepository,
                              WeighmentRepository weighmentRepository,
                              QualityInspectionRepository qualityInspectionRepository,
                              NotificationService notificationService,
                              AuditLogService auditLogService,
                              com.agriprocure.websocket.WebSocketEventPublisher eventPublisher) {
        this.procurementRepository = procurementRepository;
        this.farmerRepository = farmerRepository;
        this.cropRepository = cropRepository;
        this.cropPriceRepository = cropPriceRepository;
        this.queueTokenRepository = queueTokenRepository;
        this.weighmentRepository = weighmentRepository;
        this.qualityInspectionRepository = qualityInspectionRepository;
        this.notificationService = notificationService;
        this.auditLogService = auditLogService;
        this.eventPublisher = eventPublisher;
    }

    public ProcurementResponse createProcurement(ProcurementCreateRequest request) {
        Farmer farmer = farmerRepository.findById(request.getFarmerId())
                .orElseThrow(() -> new ResourceNotFoundException("Farmer not found with ID: " + request.getFarmerId()));

        Crop crop = cropRepository.findById(request.getCropId())
                .orElseThrow(() -> new ResourceNotFoundException("Crop not found with ID: " + request.getCropId()));

        QueueToken queueToken = null;
        if (request.getQueueTokenId() != null) {
            queueToken = queueTokenRepository.findById(request.getQueueTokenId()).orElse(null);
        }

        // Determine rate per unit from database if not explicitly provided
        BigDecimal rate = request.getRatePerUnit();
        if (rate == null || rate.compareTo(BigDecimal.ZERO) <= 0) {
            rate = cropPriceRepository.findCurrentPriceByCropId(crop.getId(), LocalDate.now())
                    .map(CropPrice::getPricePerUnit)
                    .orElseThrow(() -> new ValidationException("No active procurement price configured for crop: " + crop.getName()));
        }

        BigDecimal actualQty = request.getActualQuantity();
        BigDecimal deductions = request.getDeductions() != null ? request.getDeductions() : BigDecimal.ZERO;
        BigDecimal gross = actualQty.multiply(rate);
        BigDecimal net = gross.subtract(deductions);

        int year = Year.now().getValue();
        long count = procurementRepository.count() + 1;
        String procurementCode = String.format("PR-%d-%06d", year, count);
        while (procurementRepository.existsByProcurementCode(procurementCode)) {
            count++;
            procurementCode = String.format("PR-%d-%06d", year, count);
        }

        Procurement procurement = new Procurement(
                procurementCode,
                farmer,
                queueToken,
                crop,
                request.getDeclaredQuantity(),
                actualQty,
                rate,
                gross,
                deductions,
                net,
                ProcurementStatus.DRAFT
        );

        Procurement saved = procurementRepository.save(procurement);

        auditLogService.logAction(
                farmer.getUser(),
                "CREATE_PROCUREMENT",
                "PROCUREMENT",
                saved.getId().toString(),
                "Procurement created: " + saved.getProcurementCode() + " for " + actualQty + " " + crop.getUnit()
        );

        ProcurementResponse response = mapToResponse(saved);
        if (queueToken != null) {
            com.agriprocure.dto.RealtimeEvent event = new com.agriprocure.dto.RealtimeEvent(
                    com.agriprocure.dto.RealtimeEventType.PROCUREMENT_COMPLETED,
                    queueToken.getCentre().getId(),
                    "PROCUREMENT",
                    saved.getId().toString(),
                    response
            );
            eventPublisher.publishToCentre(queueToken.getCentre().getId(), "procurements", event);
            eventPublisher.publishToAdmin(event);
        }

        return response;
    }

    public WeighmentResponse recordWeighment(UUID procurementId, WeighmentRequest request) {
        Procurement procurement = procurementRepository.findById(procurementId)
                .orElseThrow(() -> new ResourceNotFoundException("Procurement not found with ID: " + procurementId));

        if (procurement.getStatus() == ProcurementStatus.COMPLETED || procurement.getStatus() == ProcurementStatus.CANCELLED) {
            throw new InvalidStateTransitionException("Cannot record weighment for " + procurement.getStatus() + " procurement");
        }

        Weighment weighment = new Weighment(
                procurement,
                request.getDeclaredQuantity() != null ? request.getDeclaredQuantity() : procurement.getDeclaredQuantity(),
                request.getActualWeight(),
                request.getMoisturePercentage(),
                request.getRecordedBy(),
                request.getRemarks()
        );

        Weighment savedWeighment = weighmentRepository.save(weighment);

        // Update procurement actual quantity and recalculate
        procurement.setActualQuantity(request.getActualWeight());
        procurement.calculateFinancials();
        procurement.setStatus(ProcurementStatus.WEIGHED);
        procurementRepository.save(procurement);

        WeighmentResponse weighmentResponse = new WeighmentResponse(
                savedWeighment.getId(),
                procurement.getId(),
                savedWeighment.getDeclaredQuantity(),
                savedWeighment.getActualWeight(),
                savedWeighment.getMoisturePercentage(),
                savedWeighment.getRecordedBy(),
                savedWeighment.getRecordedAt(),
                savedWeighment.getRemarks()
        );

        if (procurement.getQueueToken() != null) {
            UUID centreId = procurement.getQueueToken().getCentre().getId();
            com.agriprocure.dto.RealtimeEvent event = new com.agriprocure.dto.RealtimeEvent(
                    com.agriprocure.dto.RealtimeEventType.WEIGHMENT_COMPLETED,
                    centreId,
                    "WEIGHMENT",
                    savedWeighment.getId().toString(),
                    weighmentResponse
            );
            eventPublisher.publishToCentre(centreId, "procurements", event);
            eventPublisher.publishToCentre(centreId, "queue", event);
            eventPublisher.publishToAdmin(event);
        }

        return weighmentResponse;
    }

    public QualityInspectionResponse recordInspection(UUID procurementId, QualityInspectionRequest request) {
        Procurement procurement = procurementRepository.findById(procurementId)
                .orElseThrow(() -> new ResourceNotFoundException("Procurement not found with ID: " + procurementId));

        QualityInspection inspection = new QualityInspection(
                procurement,
                request.getGrade(),
                request.getMoisturePercentage(),
                request.getForeignMatterPercentage(),
                request.getBrokenGrainPercentage(),
                request.getInspectedBy(),
                request.getRemarks(),
                request.isApproved()
        );

        QualityInspection savedInspection = qualityInspectionRepository.save(inspection);

        if (request.isApproved() && request.getGrade() != QualityGrade.REJECTED) {
            procurement.setStatus(ProcurementStatus.APPROVED);
        } else {
            procurement.setStatus(ProcurementStatus.CANCELLED);
        }
        procurementRepository.save(procurement);

        QualityInspectionResponse inspectionResponse = new QualityInspectionResponse(
                savedInspection.getId(),
                procurement.getId(),
                savedInspection.getGrade(),
                savedInspection.getMoisturePercentage(),
                savedInspection.getForeignMatterPercentage(),
                savedInspection.getBrokenGrainPercentage(),
                savedInspection.getInspectedBy(),
                savedInspection.getInspectedAt(),
                savedInspection.getRemarks(),
                savedInspection.isApproved()
        );

        if (procurement.getQueueToken() != null) {
            UUID centreId = procurement.getQueueToken().getCentre().getId();
            com.agriprocure.dto.RealtimeEvent event = new com.agriprocure.dto.RealtimeEvent(
                    com.agriprocure.dto.RealtimeEventType.QUALITY_COMPLETED,
                    centreId,
                    "QUALITY_INSPECTION",
                    savedInspection.getId().toString(),
                    inspectionResponse
            );
            eventPublisher.publishToCentre(centreId, "procurements", event);
            eventPublisher.publishToCentre(centreId, "queue", event);
            eventPublisher.publishToAdmin(event);
        }

        return inspectionResponse;
    }

    @Transactional(readOnly = true)
    public List<ProcurementResponse> getAllProcurements() {
        return procurementRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProcurementResponse> getFarmerProcurements(UUID farmerId) {
        return procurementRepository.findByFarmerIdOrderByCreatedAtDesc(farmerId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public ProcurementResponse getOrCreateProcurementForToken(UUID queueTokenId) {
        Optional<Procurement> existing = procurementRepository.findByQueueTokenId(queueTokenId);
        if (existing.isPresent()) {
            return mapToResponse(existing.get());
        }

        QueueToken token = queueTokenRepository.findById(queueTokenId)
                .orElseThrow(() -> new ResourceNotFoundException("Queue token not found with ID: " + queueTokenId));

        Booking booking = token.getBooking();
        Crop crop = booking.getCrop();
        BigDecimal rate = cropPriceRepository.findCurrentPriceByCropId(crop.getId(), LocalDate.now())
                .map(CropPrice::getPricePerUnit)
                .orElse(new BigDecimal("2300.00"));

        BigDecimal declared = booking.getDeclaredQuantity();
        BigDecimal gross = declared.multiply(rate);

        int year = Year.now().getValue();
        long count = procurementRepository.count() + 1;
        String procurementCode = String.format("PR-%d-%06d", year, count);
        while (procurementRepository.existsByProcurementCode(procurementCode)) {
            count++;
            procurementCode = String.format("PR-%d-%06d", year, count);
        }

        Procurement procurement = new Procurement(
                procurementCode,
                booking.getFarmer(),
                token,
                crop,
                declared,
                declared,
                rate,
                gross,
                BigDecimal.ZERO,
                gross,
                ProcurementStatus.DRAFT
        );

        Procurement saved = procurementRepository.save(procurement);
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<ProcurementResponse> getCentreProcurements(UUID centreId) {
        return procurementRepository.findAll().stream()
                .filter(p -> p.getQueueToken() != null && p.getQueueToken().getCentre().getId().equals(centreId))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProcurementResponse getProcurementById(UUID id) {
        Procurement procurement = procurementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Procurement not found with ID: " + id));
        return mapToResponse(procurement);
    }

    public ProcurementResponse mapToResponse(Procurement p) {
        ProcurementResponse response = new ProcurementResponse();
        response.setId(p.getId());
        response.setProcurementCode(p.getProcurementCode());
        response.setFarmerId(p.getFarmer().getId());
        response.setFarmerName(p.getFarmer().getFullName());
        response.setFarmerCode(p.getFarmer().getFarmerCode());
        if (p.getQueueToken() != null) {
            response.setQueueTokenId(p.getQueueToken().getId());
            response.setDisplayToken(p.getQueueToken().getDisplayToken());
        }
        response.setCropId(p.getCrop().getId());
        response.setCropName(p.getCrop().getName());
        response.setCropUnit(p.getCrop().getUnit());
        response.setDeclaredQuantity(p.getDeclaredQuantity());
        response.setActualQuantity(p.getActualQuantity());
        response.setRatePerUnit(p.getRatePerUnit());
        response.setGrossAmount(p.getGrossAmount());
        response.setDeductions(p.getDeductions());
        response.setNetAmount(p.getNetAmount());
        response.setStatus(p.getStatus());
        response.setCreatedAt(p.getCreatedAt());
        response.setCompletedAt(p.getCompletedAt());

        weighmentRepository.findByProcurementId(p.getId()).ifPresent(w ->
                response.setWeighment(new WeighmentResponse(
                        w.getId(), p.getId(), w.getDeclaredQuantity(), w.getActualWeight(),
                        w.getMoisturePercentage(), w.getRecordedBy(), w.getRecordedAt(), w.getRemarks()
                ))
        );

        qualityInspectionRepository.findByProcurementId(p.getId()).ifPresent(q ->
                response.setQualityInspection(new QualityInspectionResponse(
                        q.getId(), p.getId(), q.getGrade(), q.getMoisturePercentage(),
                        q.getForeignMatterPercentage(), q.getBrokenGrainPercentage(),
                        q.getInspectedBy(), q.getInspectedAt(), q.getRemarks(), q.isApproved()
                ))
        );

        return response;
    }
}
