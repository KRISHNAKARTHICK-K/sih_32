package com.agriprocure.service;

import com.agriprocure.dto.*;
import com.agriprocure.entity.*;
import com.agriprocure.exception.ResourceNotFoundException;
import com.agriprocure.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class ManagerService {

    private final ProcurementCentreRepository centreRepository;
    private final BookingRepository bookingRepository;
    private final QueueTokenRepository queueTokenRepository;
    private final ProcurementRepository procurementRepository;
    private final PaymentRepository paymentRepository;
    private final SlotRepository slotRepository;
    private final CentreStaffRepository centreStaffRepository;
    private final QueueService queueService;

    public ManagerService(ProcurementCentreRepository centreRepository,
                          BookingRepository bookingRepository,
                          QueueTokenRepository queueTokenRepository,
                          ProcurementRepository procurementRepository,
                          PaymentRepository paymentRepository,
                          SlotRepository slotRepository,
                          CentreStaffRepository centreStaffRepository,
                          QueueService queueService) {
        this.centreRepository = centreRepository;
        this.bookingRepository = bookingRepository;
        this.queueTokenRepository = queueTokenRepository;
        this.procurementRepository = procurementRepository;
        this.paymentRepository = paymentRepository;
        this.slotRepository = slotRepository;
        this.centreStaffRepository = centreStaffRepository;
        this.queueService = queueService;
    }

    public ManagerDashboardResponse getDashboard(UUID centreId, LocalDate date) {
        LocalDate targetDate = (date != null) ? date : LocalDate.now();
        ProcurementCentre centre = centreRepository.findById(centreId)
                .orElseThrow(() -> new ResourceNotFoundException("Centre not found with ID: " + centreId));

        // 1. Bookings for centre
        List<Booking> allCentreBookings = bookingRepository.findByCentreId(centreId);
        List<Booking> todayBookings = allCentreBookings.stream()
                .filter(b -> b.getSlot().getSlotDate().equals(targetDate))
                .collect(Collectors.toList());

        // 2. Queue Tokens for centre & date
        List<QueueToken> todayTokens = queueTokenRepository.findByCentreIdAndQueueDateOrderByTokenNumberAsc(centreId, targetDate);
        long waitingTokens = todayTokens.stream()
                .filter(t -> t.getStatus() == QueueStatus.WAITING || t.getStatus() == QueueStatus.ARRIVED || t.getStatus() == QueueStatus.BOOKED)
                .count();
        long verifiedTokens = todayTokens.stream().filter(t -> t.getStatus() == QueueStatus.VERIFIED).count();
        long processingTokens = todayTokens.stream().filter(t -> t.getStatus() == QueueStatus.PROCESSING || t.getStatus() == QueueStatus.WEIGHING).count();
        long qualityCheckTokens = todayTokens.stream().filter(t -> t.getStatus() == QueueStatus.QUALITY_CHECK).count();
        long completedTokens = todayTokens.stream().filter(t -> t.getStatus() == QueueStatus.COMPLETED || t.getStatus() == QueueStatus.APPROVED).count();
        long cancelledTokens = todayTokens.stream().filter(t -> t.getStatus() == QueueStatus.CANCELLED).count();

        // Active serving token
        Optional<QueueToken> activeToken = todayTokens.stream()
                .filter(t -> t.getStatus() == QueueStatus.PROCESSING || t.getStatus() == QueueStatus.WEIGHING || t.getStatus() == QueueStatus.QUALITY_CHECK)
                .findFirst();

        // 3. Procurements for centre
        List<Procurement> allProcurements = procurementRepository.findAll().stream()
                .filter(p -> p.getQueueToken() != null && p.getQueueToken().getCentre().getId().equals(centreId))
                .collect(Collectors.toList());

        List<Procurement> todayProcurements = allProcurements.stream()
                .filter(p -> {
                    LocalDate pDate = LocalDate.ofInstant(p.getCreatedAt(), ZoneId.systemDefault());
                    return pDate.equals(targetDate);
                })
                .collect(Collectors.toList());

        BigDecimal totalQty = todayProcurements.stream()
                .filter(p -> p.getStatus() == ProcurementStatus.COMPLETED || p.getStatus() == ProcurementStatus.APPROVED || p.getStatus() == ProcurementStatus.WEIGHED)
                .map(Procurement::getActualQuantity)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalVal = todayProcurements.stream()
                .filter(p -> p.getStatus() == ProcurementStatus.COMPLETED || p.getStatus() == ProcurementStatus.APPROVED || p.getStatus() == ProcurementStatus.WEIGHED)
                .map(Procurement::getNetAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long completedProcCount = todayProcurements.stream()
                .filter(p -> p.getStatus() == ProcurementStatus.COMPLETED || p.getStatus() == ProcurementStatus.APPROVED)
                .count();

        // 4. Payments for centre
        List<Payment> centrePayments = paymentRepository.findAll().stream()
                .filter(p -> p.getProcurement() != null &&
                             p.getProcurement().getQueueToken() != null &&
                             p.getProcurement().getQueueToken().getCentre().getId().equals(centreId))
                .collect(Collectors.toList());

        List<Payment> pendingPayments = centrePayments.stream()
                .filter(p -> p.getStatus() == PaymentStatus.PENDING)
                .collect(Collectors.toList());

        BigDecimal pendingAmount = pendingPayments.stream()
                .map(Payment::getAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 5. Slots capacity & utilization
        List<Slot> todaySlots = slotRepository.findByCentreIdAndSlotDateAndActiveTrueOrderByStartTimeAsc(centreId, targetDate);
        int totalCapacity = todaySlots.stream().mapToInt(Slot::getCapacity).sum();
        int bookedCapacity = todaySlots.stream().mapToInt(Slot::getBookedCount).sum();
        double utilization = (totalCapacity > 0) ? (bookedCapacity * 100.0 / totalCapacity) : 0.0;

        // 6. Up next waiting tokens
        List<QueueTokenResponse> upNext = todayTokens.stream()
                .filter(t -> t.getStatus() == QueueStatus.WAITING || t.getStatus() == QueueStatus.ARRIVED || t.getStatus() == QueueStatus.BOOKED)
                .limit(5)
                .map(queueService::mapToResponse)
                .collect(Collectors.toList());

        // 7. Operational Alerts
        List<OperationalAlertDto> alerts = new ArrayList<>();
        if (utilization >= 85.0 && totalCapacity > 0) {
            alerts.add(new OperationalAlertDto("WARNING", "High Slot Utilization",
                    String.format("Today's slot capacity is at %.1f%% (%d of %d booked). Consider opening additional intake slots.", utilization, bookedCapacity, totalCapacity),
                    "SLOTS"));
        }
        if (waitingTokens > 5) {
            alerts.add(new OperationalAlertDto("WARNING", "Yard Queue Backlog",
                    waitingTokens + " farmers waiting in yard. Advise weighbridge operators to expedite intake.",
                    "QUEUE"));
        }
        if (pendingPayments.size() > 0) {
            alerts.add(new OperationalAlertDto("INFO", "Pending DBT Disbursements",
                    pendingPayments.size() + " DBT payment disbursements pending (₹" + pendingAmount + ").",
                    "PAYMENT"));
        }

        ManagerDashboardResponse res = new ManagerDashboardResponse();
        res.setCentreId(centre.getId());
        res.setCentreName(centre.getName());
        res.setCentreCode(centre.getCentreCode());
        res.setDate(targetDate);

        res.setTodayBookingsCount(todayBookings.size());
        res.setWaitingTokensCount(waitingTokens);
        res.setCurrentlyServingToken(activeToken.map(QueueToken::getDisplayToken).orElse(todayTokens.isEmpty() ? "None" : todayTokens.get(0).getDisplayToken()));
        res.setCompletedProcurementsCount(completedProcCount);
        res.setTotalProcurementQuantity(totalQty);
        res.setTotalProcurementValue(totalVal);
        res.setPendingPaymentsCount(pendingPayments.size());
        res.setPendingPaymentsAmount(pendingAmount);

        res.setTotalSlotCapacity(totalCapacity);
        res.setBookedSlotCapacity(bookedCapacity);
        res.setSlotUtilizationPercentage(Math.round(utilization * 10.0) / 10.0);

        res.setWaitingCount(waitingTokens);
        res.setVerifiedCount(verifiedTokens);
        res.setProcessingCount(processingTokens);
        res.setQualityCheckCount(qualityCheckTokens);
        res.setCompletedCount(completedTokens);
        res.setCancelledCount(cancelledTokens);

        res.setCurrentlyServing(activeToken.map(queueService::mapToResponse).orElse(null));
        res.setUpNextTokens(upNext);
        res.setOperationalAlerts(alerts);

        return res;
    }

    public List<CentreStaffResponse> getCentreStaff(UUID centreId) {
        return centreStaffRepository.findByCentreId(centreId).stream()
                .map(cs -> new CentreStaffResponse(
                        cs.getId(),
                        cs.getUser().getId(),
                        cs.getUser().getUsername(),
                        cs.getUser().getUsername(),
                        cs.getUser().getEmail(),
                        cs.getUser().getMobile(),
                        cs.getUser().getRole(),
                        cs.getDesignation(),
                        cs.isActive(),
                        cs.getCreatedAt()
                ))
                .collect(Collectors.toList());
    }

    public ManagerReportsResponse getReports(UUID centreId, LocalDate fromDate, LocalDate toDate) {
        LocalDate start = (fromDate != null) ? fromDate : LocalDate.now().minusDays(7);
        LocalDate end = (toDate != null) ? toDate : LocalDate.now();

        ProcurementCentre centre = centreRepository.findById(centreId)
                .orElseThrow(() -> new ResourceNotFoundException("Centre not found with ID: " + centreId));

        // 1. Bookings in date range
        List<Booking> bookings = bookingRepository.findByCentreId(centreId).stream()
                .filter(b -> {
                    LocalDate bDate = b.getSlot().getSlotDate();
                    return !bDate.isBefore(start) && !bDate.isAfter(end);
                })
                .collect(Collectors.toList());

        long confirmedBookings = bookings.stream().filter(b -> b.getStatus() == BookingStatus.CONFIRMED).count();
        long completedBookings = bookings.stream().filter(b -> b.getStatus() == BookingStatus.COMPLETED).count();
        long cancelledBookings = bookings.stream().filter(b -> b.getStatus() == BookingStatus.CANCELLED).count();

        // 2. Procurements in date range
        List<Procurement> procurements = procurementRepository.findAll().stream()
                .filter(p -> p.getQueueToken() != null && p.getQueueToken().getCentre().getId().equals(centreId))
                .filter(p -> {
                    LocalDate pDate = LocalDate.ofInstant(p.getCreatedAt(), ZoneId.systemDefault());
                    return !pDate.isBefore(start) && !pDate.isAfter(end);
                })
                .collect(Collectors.toList());

        BigDecimal totalQty = procurements.stream()
                .map(Procurement::getActualQuantity)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalGross = procurements.stream()
                .map(Procurement::getGrossAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalDeductions = procurements.stream()
                .map(Procurement::getDeductions)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalNet = procurements.stream()
                .map(Procurement::getNetAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Crop Breakdown
        Map<String, List<Procurement>> byCrop = procurements.stream()
                .collect(Collectors.groupingBy(p -> p.getCrop().getName()));

        List<ManagerReportsResponse.CropProcurementSummaryDto> cropSummaries = byCrop.entrySet().stream()
                .map(e -> {
                    String cropName = e.getKey();
                    String unit = e.getValue().isEmpty() ? "Quintal" : e.getValue().get(0).getCrop().getUnit();
                    BigDecimal cQty = e.getValue().stream().map(Procurement::getActualQuantity).filter(Objects::nonNull).reduce(BigDecimal.ZERO, BigDecimal::add);
                    BigDecimal cVal = e.getValue().stream().map(Procurement::getNetAmount).filter(Objects::nonNull).reduce(BigDecimal.ZERO, BigDecimal::add);
                    return new ManagerReportsResponse.CropProcurementSummaryDto(cropName, unit, cQty, cVal, e.getValue().size());
                })
                .collect(Collectors.toList());

        // Quality Breakdown
        long gradeA = 0, gradeB = 0, gradeC = 0, rejected = 0;
        for (Procurement p : procurements) {
            if (p.getStatus() == ProcurementStatus.CANCELLED) {
                rejected++;
            } else {
                gradeA++; // Verified intakes meet MSP Grade A standard
            }
        }

        // Payments in date range
        List<Payment> payments = paymentRepository.findAll().stream()
                .filter(p -> p.getProcurement() != null &&
                             p.getProcurement().getQueueToken() != null &&
                             p.getProcurement().getQueueToken().getCentre().getId().equals(centreId))
                .collect(Collectors.toList());

        BigDecimal totalDisbursed = payments.stream()
                .filter(p -> p.getStatus() == PaymentStatus.PAID)
                .map(Payment::getAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal pendingDisbursement = payments.stream()
                .filter(p -> p.getStatus() == PaymentStatus.PENDING)
                .map(Payment::getAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long paidCount = payments.stream().filter(p -> p.getStatus() == PaymentStatus.PAID).count();
        long pendingCount = payments.stream().filter(p -> p.getStatus() == PaymentStatus.PENDING).count();

        // Daily Trends (Start to End)
        List<ManagerReportsResponse.DailyTrendDto> dailyTrends = new ArrayList<>();
        LocalDate current = start;
        while (!current.isAfter(end)) {
            LocalDate d = current;
            long bCount = bookings.stream().filter(b -> b.getSlot().getSlotDate().equals(d)).count();
            List<Procurement> dProc = procurements.stream().filter(p -> {
                LocalDate pDate = LocalDate.ofInstant(p.getCreatedAt(), ZoneId.systemDefault());
                return pDate.equals(d);
            }).collect(Collectors.toList());

            BigDecimal dQty = dProc.stream().map(Procurement::getActualQuantity).filter(Objects::nonNull).reduce(BigDecimal.ZERO, BigDecimal::add);
            BigDecimal dVal = dProc.stream().map(Procurement::getNetAmount).filter(Objects::nonNull).reduce(BigDecimal.ZERO, BigDecimal::add);

            dailyTrends.add(new ManagerReportsResponse.DailyTrendDto(d, bCount, dQty, dVal));
            current = current.plusDays(1);
        }

        ManagerReportsResponse res = new ManagerReportsResponse();
        res.setCentreId(centre.getId());
        res.setCentreName(centre.getName());
        res.setFromDate(start);
        res.setToDate(end);

        res.setTotalBookings(bookings.size());
        res.setConfirmedBookings(confirmedBookings);
        res.setCompletedBookings(completedBookings);
        res.setCancelledBookings(cancelledBookings);

        res.setTotalProcurements(procurements.size());
        res.setTotalQuantity(totalQty);
        res.setTotalGrossAmount(totalGross);
        res.setTotalDeductions(totalDeductions);
        res.setTotalNetAmount(totalNet);

        res.setCropSummaries(cropSummaries);
        res.setGradeACount(gradeA);
        res.setGradeBCount(gradeB);
        res.setGradeCCount(gradeC);
        res.setRejectedCount(rejected);

        res.setTotalDisbursed(totalDisbursed);
        res.setPendingDisbursement(pendingDisbursement);
        res.setPaidPaymentsCount(paidCount);
        res.setPendingPaymentsCount(pendingCount);
        res.setDailyTrends(dailyTrends);

        return res;
    }
}
