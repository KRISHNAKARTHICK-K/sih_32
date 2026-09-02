package com.agriprocure.service;

import com.agriprocure.dto.*;
import com.agriprocure.entity.*;
import com.agriprocure.exception.ResourceNotFoundException;
import com.agriprocure.exception.ValidationException;
import com.agriprocure.repository.*;
import com.agriprocure.security.SecurityUtils;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;
import java.lang.management.ManagementFactory;
import java.math.BigDecimal;
import java.sql.Connection;
import java.time.Instant;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class AdminService {

    private final UserRepository userRepository;
    private final FarmerRepository farmerRepository;
    private final ProcurementCentreRepository centreRepository;
    private final CentreStaffRepository centreStaffRepository;
    private final CropRepository cropRepository;
    private final CropPriceRepository cropPriceRepository;
    private final BookingRepository bookingRepository;
    private final QueueTokenRepository queueTokenRepository;
    private final ProcurementRepository procurementRepository;
    private final PaymentRepository paymentRepository;
    private final AuditLogRepository auditLogRepository;
    private final AuditLogService auditLogService;
    private final BookingService bookingService;
    private final ProcurementService procurementService;
    private final PaymentService paymentService;
    private final CentreService centreService;
    private final PasswordEncoder passwordEncoder;
    private final DataSource dataSource;

    public AdminService(UserRepository userRepository,
                        FarmerRepository farmerRepository,
                        ProcurementCentreRepository centreRepository,
                        CentreStaffRepository centreStaffRepository,
                        CropRepository cropRepository,
                        CropPriceRepository cropPriceRepository,
                        BookingRepository bookingRepository,
                        QueueTokenRepository queueTokenRepository,
                        ProcurementRepository procurementRepository,
                        PaymentRepository paymentRepository,
                        AuditLogRepository auditLogRepository,
                        AuditLogService auditLogService,
                        BookingService bookingService,
                        ProcurementService procurementService,
                        PaymentService paymentService,
                        CentreService centreService,
                        PasswordEncoder passwordEncoder,
                        DataSource dataSource) {
        this.userRepository = userRepository;
        this.farmerRepository = farmerRepository;
        this.centreRepository = centreRepository;
        this.centreStaffRepository = centreStaffRepository;
        this.cropRepository = cropRepository;
        this.cropPriceRepository = cropPriceRepository;
        this.bookingRepository = bookingRepository;
        this.queueTokenRepository = queueTokenRepository;
        this.procurementRepository = procurementRepository;
        this.paymentRepository = paymentRepository;
        this.auditLogRepository = auditLogRepository;
        this.auditLogService = auditLogService;
        this.bookingService = bookingService;
        this.procurementService = procurementService;
        this.paymentService = paymentService;
        this.centreService = centreService;
        this.passwordEncoder = passwordEncoder;
        this.dataSource = dataSource;
    }

    // ==========================================
    // 1. ADMIN DASHBOARD OVERVIEW
    // ==========================================
    @Transactional(readOnly = true)
    public AdminDashboardResponse getDashboard() {
        LocalDate today = LocalDate.now();

        long totalFarmers = farmerRepository.count();
        long activeCentres = centreRepository.findByActiveTrue().size();

        List<Booking> allBookings = bookingRepository.findAll();
        long todayBookings = allBookings.stream()
                .filter(b -> b.getSlot() != null && today.equals(b.getSlot().getSlotDate()))
                .count();

        List<QueueToken> allTokens = queueTokenRepository.findAll();
        long activeQueueTokens = allTokens.stream()
                .filter(t -> today.equals(t.getQueueDate()) && t.getStatus() != QueueStatus.COMPLETED && t.getStatus() != QueueStatus.CANCELLED)
                .count();

        List<Procurement> procurements = procurementRepository.findAll();
        BigDecimal totalQuantity = procurements.stream()
                .map(Procurement::getActualQuantity)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalProcurementValue = procurements.stream()
                .map(Procurement::getNetAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<Payment> payments = paymentRepository.findAll();
        List<Payment> pendingPaymentsList = payments.stream()
                .filter(p -> p.getStatus() == PaymentStatus.PENDING)
                .collect(Collectors.toList());

        long pendingPaymentsCount = pendingPaymentsList.size();
        BigDecimal pendingPaymentsAmount = pendingPaymentsList.stream()
                .map(Payment::getAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long activeUsersCount = userRepository.findAll().stream()
                .filter(User::isEnabled)
                .count();

        // Centre Summaries
        List<ProcurementCentre> centres = centreRepository.findAll();
        List<AdminCentreSummaryResponse> centreSummaries = centres.stream()
                .map(c -> buildCentreSummary(c, today))
                .collect(Collectors.toList());

        // Recent Audit Activity (top 10)
        List<AdminAuditLogResponse> recentActivity = auditLogRepository.findAllByOrderByCreatedAtDesc().stream()
                .limit(10)
                .map(this::mapToAuditResponse)
                .collect(Collectors.toList());

        return new AdminDashboardResponse(
                totalFarmers,
                activeCentres,
                todayBookings,
                activeQueueTokens,
                totalQuantity,
                totalProcurementValue,
                pendingPaymentsCount,
                pendingPaymentsAmount,
                activeUsersCount,
                centreSummaries,
                recentActivity
        );
    }

    private AdminCentreSummaryResponse buildCentreSummary(ProcurementCentre centre, LocalDate today) {
        List<CentreStaff> staff = centreStaffRepository.findByCentreId(centre.getId());
        int staffCount = staff.size();

        List<Booking> centreBookings = bookingRepository.findByCentreId(centre.getId());
        int todayBookings = (int) centreBookings.stream()
                .filter(b -> b.getSlot() != null && today.equals(b.getSlot().getSlotDate()))
                .count();

        List<QueueToken> centreTokens = queueTokenRepository.findByCentreIdAndQueueDateOrderByTokenNumberAsc(centre.getId(), today);
        int waitingTokens = (int) centreTokens.stream()
                .filter(t -> t.getStatus() == QueueStatus.WAITING || t.getStatus() == QueueStatus.ARRIVED || t.getStatus() == QueueStatus.BOOKED)
                .count();

        String currentlyServing = centreTokens.stream()
                .filter(t -> t.getStatus() == QueueStatus.PROCESSING || t.getStatus() == QueueStatus.WEIGHING || t.getStatus() == QueueStatus.QUALITY_CHECK)
                .map(QueueToken::getDisplayToken)
                .findFirst()
                .orElse("None");

        List<Procurement> centreProcurements = procurementRepository.findAll().stream()
                .filter(p -> p.getQueueToken() != null && centre.getId().equals(p.getQueueToken().getCentre().getId()))
                .collect(Collectors.toList());

        BigDecimal procurementQuantity = centreProcurements.stream()
                .map(Procurement::getActualQuantity)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal procurementValue = centreProcurements.stream()
                .map(Procurement::getNetAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<Payment> centrePayments = paymentRepository.findAll().stream()
                .filter(p -> p.getProcurement() != null && p.getProcurement().getQueueToken() != null &&
                        centre.getId().equals(p.getProcurement().getQueueToken().getCentre().getId()))
                .collect(Collectors.toList());

        BigDecimal pendingPayments = centrePayments.stream()
                .filter(p -> p.getStatus() == PaymentStatus.PENDING)
                .map(Payment::getAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Utilization calculation
        int totalCapacity = centreBookings.stream()
                .filter(b -> b.getSlot() != null && today.equals(b.getSlot().getSlotDate()))
                .mapToInt(b -> b.getSlot().getCapacity())
                .distinct()
                .sum();
        double utilization = totalCapacity > 0 ? (todayBookings * 100.0) / totalCapacity : 0.0;

        return new AdminCentreSummaryResponse(
                centre.getId(),
                centre.getCentreCode(),
                centre.getName(),
                centre.getDistrict(),
                centre.getState(),
                centre.isActive(),
                staffCount,
                todayBookings,
                waitingTokens,
                currentlyServing,
                procurementQuantity,
                procurementValue,
                pendingPayments,
                Math.round(utilization * 10.0) / 10.0
        );
    }

    // ==========================================
    // 2. USER MANAGEMENT
    // ==========================================
    @Transactional(readOnly = true)
    public List<AdminUserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToUserResponse)
                .collect(Collectors.toList());
    }

    public AdminUserResponse createUser(AdminUserCreateRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new ValidationException("Username is already in use: " + request.getUsername());
        }
        if (request.getEmail() != null && !request.getEmail().isBlank() && userRepository.existsByEmail(request.getEmail())) {
            throw new ValidationException("Email is already in use: " + request.getEmail());
        }

        User user = new User(
                request.getUsername(),
                request.getEmail(),
                request.getMobile(),
                passwordEncoder.encode(request.getPassword()),
                request.getRole()
        );
        User savedUser = userRepository.save(user);

        // If Role is OPERATOR or CENTRE_MANAGER, link with Procurement Centre if provided
        if ((request.getRole() == Role.OPERATOR || request.getRole() == Role.CENTRE_MANAGER) && request.getCentreId() != null) {
            ProcurementCentre centre = centreRepository.findById(request.getCentreId())
                    .orElseThrow(() -> new ResourceNotFoundException("Centre not found with ID: " + request.getCentreId()));
            String designation = request.getDesignation() != null ? request.getDesignation() :
                    (request.getRole() == Role.CENTRE_MANAGER ? "Centre Manager" : "Intake Operator");
            centreStaffRepository.save(new CentreStaff(savedUser, centre, designation));
        }

        // If Role is FARMER, create linked Farmer Profile
        if (request.getRole() == Role.FARMER) {
            long farmerCount = farmerRepository.count() + 1;
            String farmerCode = String.format("FAR-%06d", farmerCount);
            while (farmerRepository.existsByFarmerCode(farmerCode)) {
                farmerCount++;
                farmerCode = String.format("FAR-%06d", farmerCount);
            }
            Farmer farmer = new Farmer(
                    farmerCode,
                    savedUser,
                    request.getFullName(),
                    request.getMobile(),
                    request.getEmail(),
                    request.getVillage() != null ? request.getVillage() : "Local Village",
                    request.getDistrict() != null ? request.getDistrict() : "District",
                    request.getState() != null ? request.getState() : "State",
                    request.getAddress() != null ? request.getAddress() : "Address"
            );
            farmerRepository.save(farmer);
        }

        User actor = SecurityUtils.getCurrentUser();
        auditLogService.logAction(
                actor,
                "ADMIN_CREATED_USER",
                "USER",
                savedUser.getId().toString(),
                "Created user @" + savedUser.getUsername() + " with role " + savedUser.getRole()
        );

        return mapToUserResponse(savedUser);
    }

    public AdminUserResponse updateUser(UUID userId, AdminUserUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        if (request.getEmail() != null) user.setEmail(request.getEmail());
        if (request.getMobile() != null) user.setMobile(request.getMobile());
        if (request.getEnabled() != null) user.setEnabled(request.getEnabled());

        User updatedUser = userRepository.save(user);

        // Update Centre Staff if provided
        if (request.getCentreId() != null) {
            ProcurementCentre centre = centreRepository.findById(request.getCentreId())
                    .orElseThrow(() -> new ResourceNotFoundException("Centre not found with ID: " + request.getCentreId()));
            Optional<CentreStaff> staffOpt = centreStaffRepository.findByUserId(userId);
            if (staffOpt.isPresent()) {
                CentreStaff staff = staffOpt.get();
                staff.setCentre(centre);
                if (request.getDesignation() != null) staff.setDesignation(request.getDesignation());
                centreStaffRepository.save(staff);
            } else {
                String designation = request.getDesignation() != null ? request.getDesignation() : "Staff Member";
                centreStaffRepository.save(new CentreStaff(updatedUser, centre, designation));
            }
        }

        User actor = SecurityUtils.getCurrentUser();
        auditLogService.logAction(
                actor,
                "ADMIN_UPDATED_USER",
                "USER",
                updatedUser.getId().toString(),
                "Updated user details for @" + updatedUser.getUsername()
        );

        return mapToUserResponse(updatedUser);
    }

    public AdminUserResponse updateUserStatus(UUID userId, boolean enabled) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));
        user.setEnabled(enabled);
        User updated = userRepository.save(user);

        User actor = SecurityUtils.getCurrentUser();
        auditLogService.logAction(
                actor,
                "ADMIN_UPDATED_USER_STATUS",
                "USER",
                updated.getId().toString(),
                "Set user @" + updated.getUsername() + " status enabled=" + enabled
        );

        return mapToUserResponse(updated);
    }

    private AdminUserResponse mapToUserResponse(User user) {
        UUID centreId = null;
        String centreName = null;
        String designation = null;
        UUID farmerId = null;
        String farmerCode = null;
        String fullName = user.getUsername();

        Optional<CentreStaff> staffOpt = centreStaffRepository.findByUserId(user.getId());
        if (staffOpt.isPresent()) {
            CentreStaff staff = staffOpt.get();
            centreId = staff.getCentre().getId();
            centreName = staff.getCentre().getName();
            designation = staff.getDesignation();
        }

        Optional<Farmer> farmerOpt = farmerRepository.findByUserId(user.getId());
        if (farmerOpt.isPresent()) {
            Farmer farmer = farmerOpt.get();
            farmerId = farmer.getId();
            farmerCode = farmer.getFarmerCode();
            fullName = farmer.getFullName();
        }

        return new AdminUserResponse(
                user.getId(),
                user.getUsername(),
                fullName,
                user.getEmail(),
                user.getMobile(),
                user.getRole().name(),
                user.isEnabled(),
                user.getCreatedAt(),
                centreId,
                centreName,
                designation,
                farmerId,
                farmerCode
        );
    }

    // ==========================================
    // 3. PROCUREMENT CENTRE MANAGEMENT
    // ==========================================
    @Transactional(readOnly = true)
    public List<AdminCentreSummaryResponse> getAllCentres() {
        LocalDate today = LocalDate.now();
        return centreRepository.findAll().stream()
                .map(c -> buildCentreSummary(c, today))
                .collect(Collectors.toList());
    }

    public CentreResponse createCentre(CentreCreateRequest request) {
        CentreResponse response = centreService.createCentre(request);
        User actor = SecurityUtils.getCurrentUser();
        auditLogService.logAction(
                actor,
                "ADMIN_CREATED_CENTRE",
                "CENTRE",
                response.getId().toString(),
                "Created procurement centre: " + response.getName() + " (" + response.getCentreCode() + ")"
        );
        return response;
    }

    public CentreResponse updateCentre(UUID centreId, AdminCentreUpdateRequest request) {
        ProcurementCentre centre = centreRepository.findById(centreId)
                .orElseThrow(() -> new ResourceNotFoundException("Centre not found with ID: " + centreId));

        if (request.getName() != null) centre.setName(request.getName());
        if (request.getAddress() != null) centre.setAddress(request.getAddress());
        if (request.getVillage() != null) centre.setVillage(request.getVillage());
        if (request.getDistrict() != null) centre.setDistrict(request.getDistrict());
        if (request.getState() != null) centre.setState(request.getState());
        if (request.getContactNumber() != null) centre.setContactNumber(request.getContactNumber());
        if (request.getActive() != null) centre.setActive(request.getActive());

        ProcurementCentre saved = centreRepository.save(centre);
        User actor = SecurityUtils.getCurrentUser();
        auditLogService.logAction(
                actor,
                "ADMIN_UPDATED_CENTRE",
                "CENTRE",
                saved.getId().toString(),
                "Updated procurement centre details: " + saved.getName()
        );
        return centreService.mapToResponse(saved);
    }

    public CentreResponse updateCentreStatus(UUID centreId, boolean active) {
        ProcurementCentre centre = centreRepository.findById(centreId)
                .orElseThrow(() -> new ResourceNotFoundException("Centre not found with ID: " + centreId));
        centre.setActive(active);
        ProcurementCentre saved = centreRepository.save(centre);
        User actor = SecurityUtils.getCurrentUser();
        auditLogService.logAction(
                actor,
                "ADMIN_UPDATED_CENTRE_STATUS",
                "CENTRE",
                saved.getId().toString(),
                "Set centre " + saved.getCentreCode() + " status active=" + active
        );
        return centreService.mapToResponse(saved);
    }

    // ==========================================
    // 4. CROPS & MSP PRICES MASTER DATA
    // ==========================================
    @Transactional(readOnly = true)
    public List<CropResponse> getAllCrops(boolean activeOnly) {
        List<Crop> crops = activeOnly ? cropRepository.findByActiveTrue() : cropRepository.findAll();
        LocalDate today = LocalDate.now();
        return crops.stream()
                .map(crop -> {
                    BigDecimal price = cropPriceRepository.findCurrentPriceByCropId(crop.getId(), today)
                            .map(CropPrice::getPricePerUnit)
                            .orElse(BigDecimal.ZERO);
                    return new CropResponse(
                            crop.getId(),
                            crop.getCode(),
                            crop.getName(),
                            crop.getUnit(),
                            price,
                            crop.isActive(),
                            crop.getCreatedAt()
                    );
                })
                .collect(Collectors.toList());
    }

    public CropResponse createCrop(AdminCropCreateRequest request) {
        if (cropRepository.existsByCode(request.getCode().toUpperCase())) {
            throw new ValidationException("Crop code already exists: " + request.getCode());
        }

        Crop crop = new Crop(
                request.getCode().toUpperCase(),
                request.getName(),
                request.getUnit() != null ? request.getUnit().toUpperCase() : "QUINTAL"
        );
        Crop saved = cropRepository.save(crop);

        User actor = SecurityUtils.getCurrentUser();
        auditLogService.logAction(
                actor,
                "ADMIN_CREATED_CROP",
                "CROP",
                saved.getId().toString(),
                "Created crop: " + saved.getName() + " (" + saved.getCode() + ")"
        );

        return new CropResponse(saved.getId(), saved.getCode(), saved.getName(), saved.getUnit(), BigDecimal.ZERO, saved.isActive(), saved.getCreatedAt());
    }

    public CropResponse updateCrop(UUID cropId, AdminCropUpdateRequest request) {
        Crop crop = cropRepository.findById(cropId)
                .orElseThrow(() -> new ResourceNotFoundException("Crop not found with ID: " + cropId));

        if (request.getName() != null) crop.setName(request.getName());
        if (request.getUnit() != null) crop.setUnit(request.getUnit().toUpperCase());
        if (request.getActive() != null) crop.setActive(request.getActive());

        Crop saved = cropRepository.save(crop);
        BigDecimal price = cropPriceRepository.findCurrentPriceByCropId(saved.getId(), LocalDate.now())
                .map(CropPrice::getPricePerUnit)
                .orElse(BigDecimal.ZERO);

        User actor = SecurityUtils.getCurrentUser();
        auditLogService.logAction(
                actor,
                "ADMIN_UPDATED_CROP",
                "CROP",
                saved.getId().toString(),
                "Updated crop: " + saved.getName()
        );

        return new CropResponse(saved.getId(), saved.getCode(), saved.getName(), saved.getUnit(), price, saved.isActive(), saved.getCreatedAt());
    }

    public CropResponse updateCropStatus(UUID cropId, boolean active) {
        Crop crop = cropRepository.findById(cropId)
                .orElseThrow(() -> new ResourceNotFoundException("Crop not found with ID: " + cropId));
        crop.setActive(active);
        Crop saved = cropRepository.save(crop);

        BigDecimal price = cropPriceRepository.findCurrentPriceByCropId(saved.getId(), LocalDate.now())
                .map(CropPrice::getPricePerUnit)
                .orElse(BigDecimal.ZERO);

        User actor = SecurityUtils.getCurrentUser();
        auditLogService.logAction(
                actor,
                "ADMIN_UPDATED_CROP_STATUS",
                "CROP",
                saved.getId().toString(),
                "Set crop " + saved.getCode() + " active=" + active
        );

        return new CropResponse(saved.getId(), saved.getCode(), saved.getName(), saved.getUnit(), price, saved.isActive(), saved.getCreatedAt());
    }

    @Transactional(readOnly = true)
    public List<CropPriceResponse> getAllPrices() {
        return cropPriceRepository.findAllByOrderByEffectiveFromDesc().stream()
                .map(cp -> new CropPriceResponse(
                        cp.getId(),
                        cp.getCrop().getId(),
                        cp.getCrop().getCode(),
                        cp.getCrop().getName(),
                        cp.getPricePerUnit(),
                        cp.getEffectiveFrom(),
                        cp.getEffectiveTo(),
                        cp.isActive(),
                        cp.getCreatedAt()
                ))
                .collect(Collectors.toList());
    }

    public CropPriceResponse createCropPrice(AdminCropPriceCreateRequest request) {
        Crop crop = cropRepository.findById(request.getCropId())
                .orElseThrow(() -> new ResourceNotFoundException("Crop not found with ID: " + request.getCropId()));

        if (request.getEffectiveTo() != null && request.getEffectiveFrom().isAfter(request.getEffectiveTo())) {
            throw new ValidationException("Effective from date cannot be after effective to date");
        }

        CropPrice price = new CropPrice(
                crop,
                request.getPricePerUnit(),
                request.getEffectiveFrom(),
                request.getEffectiveTo()
        );
        CropPrice saved = cropPriceRepository.save(price);

        User actor = SecurityUtils.getCurrentUser();
        auditLogService.logAction(
                actor,
                "ADMIN_CREATED_PRICE",
                "CROP_PRICE",
                saved.getId().toString(),
                "Configured MSP for " + crop.getName() + " at ₹" + saved.getPricePerUnit() + " from " + saved.getEffectiveFrom()
        );

        return new CropPriceResponse(
                saved.getId(),
                crop.getId(),
                crop.getCode(),
                crop.getName(),
                saved.getPricePerUnit(),
                saved.getEffectiveFrom(),
                saved.getEffectiveTo(),
                saved.isActive(),
                saved.getCreatedAt()
        );
    }

    public CropPriceResponse updateCropPriceStatus(UUID priceId, boolean active) {
        CropPrice price = cropPriceRepository.findById(priceId)
                .orElseThrow(() -> new ResourceNotFoundException("Crop price not found with ID: " + priceId));
        price.setActive(active);
        CropPrice saved = cropPriceRepository.save(price);

        User actor = SecurityUtils.getCurrentUser();
        auditLogService.logAction(
                actor,
                "ADMIN_UPDATED_PRICE_STATUS",
                "CROP_PRICE",
                saved.getId().toString(),
                "Set crop price active=" + active
        );

        return new CropPriceResponse(
                saved.getId(),
                saved.getCrop().getId(),
                saved.getCrop().getCode(),
                saved.getCrop().getName(),
                saved.getPricePerUnit(),
                saved.getEffectiveFrom(),
                saved.getEffectiveTo(),
                saved.isActive(),
                saved.getCreatedAt()
        );
    }

    // ==========================================
    // 5. REGISTRY ENTITIES (Bookings, Procurements, Payments, Farmers)
    // ==========================================
    @Transactional(readOnly = true)
    public List<BookingResponse> getAllBookings() {
        return bookingRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(b -> bookingService.mapToResponse(b, null))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProcurementResponse> getAllProcurements() {
        return procurementRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(procurementService::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PaymentResponse> getAllPayments() {
        return paymentRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(paymentService::mapToResponse)
                .collect(Collectors.toList());
    }

    // ==========================================
    // 6. AUDIT LOGS
    // ==========================================
    @Transactional(readOnly = true)
    public List<AdminAuditLogResponse> getAuditLogs(String action, String entityType, String username, Integer limit) {
        List<AuditLog> logs = auditLogRepository.findAllByOrderByCreatedAtDesc();

        return logs.stream()
                .filter(l -> action == null || action.equalsIgnoreCase("ALL") || action.equalsIgnoreCase(l.getAction()))
                .filter(l -> entityType == null || entityType.equalsIgnoreCase("ALL") || entityType.equalsIgnoreCase(l.getEntityType()))
                .filter(l -> username == null || username.isBlank() || (l.getUser() != null && l.getUser().getUsername().toLowerCase().contains(username.toLowerCase())))
                .limit(limit != null && limit > 0 ? limit : 200)
                .map(this::mapToAuditResponse)
                .collect(Collectors.toList());
    }

    private AdminAuditLogResponse mapToAuditResponse(AuditLog log) {
        String username = log.getUser() != null ? log.getUser().getUsername() : "SYSTEM";
        String userRole = log.getUser() != null ? log.getUser().getRole().name() : "SYSTEM";
        String fullName = username;

        if (log.getUser() != null) {
            Optional<Farmer> farmerOpt = farmerRepository.findByUserId(log.getUser().getId());
            if (farmerOpt.isPresent()) {
                fullName = farmerOpt.get().getFullName();
            }
        }

        return new AdminAuditLogResponse(
                log.getId(),
                log.getCreatedAt(),
                username,
                fullName,
                userRole,
                log.getAction(),
                log.getEntityType(),
                log.getEntityId(),
                log.getDescription()
        );
    }

    // ==========================================
    // 7. SYSTEM HEALTH & METRICS
    // ==========================================
    @Transactional(readOnly = true)
    public AdminSystemHealthResponse getSystemHealth() {
        String backendStatus = "UP";
        String databaseStatus = "UNKNOWN";

        try (Connection connection = dataSource.getConnection()) {
            if (connection.isValid(2)) {
                databaseStatus = "UP";
            } else {
                databaseStatus = "DEGRADED";
            }
        } catch (Exception e) {
            databaseStatus = "DOWN";
        }

        Runtime runtime = Runtime.getRuntime();
        long totalMemory = runtime.totalMemory();
        long freeMemory = runtime.freeMemory();
        long maxMemory = runtime.maxMemory();
        long usedMemory = totalMemory - freeMemory;

        long uptimeSeconds = ManagementFactory.getRuntimeMXBean().getUptime() / 1000;

        return new AdminSystemHealthResponse(
                backendStatus,
                databaseStatus,
                "PostgreSQL / H2 Dialect",
                10,
                usedMemory / (1024 * 1024),
                maxMemory / (1024 * 1024),
                freeMemory / (1024 * 1024),
                uptimeSeconds,
                "PRODUCTION_STANDBY",
                Instant.now()
        );
    }
}
