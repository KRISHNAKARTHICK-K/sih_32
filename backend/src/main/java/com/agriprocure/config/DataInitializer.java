package com.agriprocure.config;

import com.agriprocure.entity.*;
import com.agriprocure.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Configuration
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final FarmerRepository farmerRepository;
    private final ProcurementCentreRepository centreRepository;
    private final CentreStaffRepository centreStaffRepository;
    private final CropRepository cropRepository;
    private final CropPriceRepository cropPriceRepository;
    private final SlotRepository slotRepository;
    private final BookingRepository bookingRepository;
    private final QueueTokenRepository queueTokenRepository;
    private final ProcurementRepository procurementRepository;
    private final WeighmentRepository weighmentRepository;
    private final QualityInspectionRepository qualityInspectionRepository;
    private final PaymentRepository paymentRepository;
    private final NotificationRepository notificationRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           FarmerRepository farmerRepository,
                           ProcurementCentreRepository centreRepository,
                           CentreStaffRepository centreStaffRepository,
                           CropRepository cropRepository,
                           CropPriceRepository cropPriceRepository,
                           SlotRepository slotRepository,
                           BookingRepository bookingRepository,
                           QueueTokenRepository queueTokenRepository,
                           ProcurementRepository procurementRepository,
                           WeighmentRepository weighmentRepository,
                           QualityInspectionRepository qualityInspectionRepository,
                           PaymentRepository paymentRepository,
                           NotificationRepository notificationRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.farmerRepository = farmerRepository;
        this.centreRepository = centreRepository;
        this.centreStaffRepository = centreStaffRepository;
        this.cropRepository = cropRepository;
        this.cropPriceRepository = cropPriceRepository;
        this.slotRepository = slotRepository;
        this.bookingRepository = bookingRepository;
        this.queueTokenRepository = queueTokenRepository;
        this.procurementRepository = procurementRepository;
        this.weighmentRepository = weighmentRepository;
        this.qualityInspectionRepository = qualityInspectionRepository;
        this.paymentRepository = paymentRepository;
        this.notificationRepository = notificationRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() > 0) {
            log.info("AGRIPROCURE Database already initialized. Skipping seed data insertion.");
            return;
        }

        log.info("Initializing AGRIPROCURE database with Step 3 authentication and seed data...");

        // 1. Seed System Staff Users with BCrypt Passwords
        User adminUser = userRepository.save(new User("admin", "admin@agriprocure.gov.in", "9876543210", passwordEncoder.encode("Admin@123"), Role.ADMIN));
        User managerUser = userRepository.save(new User("manager", "manager@agriprocure.gov.in", "9876543211", passwordEncoder.encode("Manager@123"), Role.CENTRE_MANAGER));
        User operatorUser = userRepository.save(new User("operator", "operator@agriprocure.gov.in", "9876543212", passwordEncoder.encode("Operator@123"), Role.OPERATOR));

        // 2. Seed Procurement Centres
        ProcurementCentre pollachiCentre = centreRepository.save(new ProcurementCentre(
                "PC-001",
                "Pollachi Procurement Centre",
                "Regulated Market Yard, Main Road",
                "Pollachi",
                "Coimbatore",
                "Tamil Nadu",
                "04259-223344"
        ));

        ProcurementCentre coimbatoreCentre = centreRepository.save(new ProcurementCentre(
                "PC-002",
                "Coimbatore Procurement Centre",
                "Central Grain Yard, Trichy Road",
                "Singanallur",
                "Coimbatore",
                "Tamil Nadu",
                "0422-2556677"
        ));

        // 3. Seed Centre Staff
        centreStaffRepository.save(new CentreStaff(managerUser, pollachiCentre, "Centre Manager"));
        centreStaffRepository.save(new CentreStaff(operatorUser, pollachiCentre, "Weighbridge & Intake Operator"));

        // 4. Seed Crops and Current MSP Prices
        Crop paddy = cropRepository.save(new Crop("PADDY", "Paddy (Common / Grade-A)", "QUINTAL"));
        Crop wheat = cropRepository.save(new Crop("WHEAT", "Wheat (Milling Quality)", "QUINTAL"));
        Crop maize = cropRepository.save(new Crop("MAIZE", "Maize (Hybrid Feed)", "QUINTAL"));
        Crop cotton = cropRepository.save(new Crop("COTTON", "Cotton (Medium Staple)", "QUINTAL"));

        LocalDate today = LocalDate.now();
        LocalDate startOfYear = LocalDate.of(today.getYear(), 1, 1);
        LocalDate endOfYear = LocalDate.of(today.getYear(), 12, 31);

        cropPriceRepository.save(new CropPrice(paddy, new BigDecimal("2300.00"), startOfYear, endOfYear));
        cropPriceRepository.save(new CropPrice(wheat, new BigDecimal("2275.00"), startOfYear, endOfYear));
        cropPriceRepository.save(new CropPrice(maize, new BigDecimal("2090.00"), startOfYear, endOfYear));
        cropPriceRepository.save(new CropPrice(cotton, new BigDecimal("6620.00"), startOfYear, endOfYear));

        // 5. Seed Slots for Today and Tomorrow
        List<Slot> slots = new ArrayList<>();
        // Today's Slots
        slots.add(new Slot(pollachiCentre, today, LocalTime.of(8, 0), LocalTime.of(10, 0), 25));
        slots.add(new Slot(pollachiCentre, today, LocalTime.of(10, 0), LocalTime.of(12, 0), 30));
        slots.add(new Slot(pollachiCentre, today, LocalTime.of(13, 0), LocalTime.of(15, 0), 25));
        slots.add(new Slot(pollachiCentre, today, LocalTime.of(15, 0), LocalTime.of(17, 0), 20));

        // Tomorrow's Slots
        LocalDate tomorrow = today.plusDays(1);
        slots.add(new Slot(pollachiCentre, tomorrow, LocalTime.of(8, 0), LocalTime.of(10, 0), 30));
        slots.add(new Slot(pollachiCentre, tomorrow, LocalTime.of(10, 0), LocalTime.of(12, 0), 30));
        slots.add(new Slot(coimbatoreCentre, today, LocalTime.of(9, 0), LocalTime.of(12, 0), 40));
        slots.add(new Slot(coimbatoreCentre, tomorrow, LocalTime.of(9, 0), LocalTime.of(12, 0), 40));

        slots = slotRepository.saveAll(slots);
        Slot activeSlot1 = slots.get(0);
        Slot activeSlot2 = slots.get(1);

        // 6. Seed Realistic Farmers (farmer1 / Farmer@123, etc.)
        List<Farmer> farmers = new ArrayList<>();
        String[][] farmerData = {
                {"farmer1", "Muthusamy K", "9842112345", "farmer1@agriprocure.test", "Anaimalai", "Coimbatore", "Tamil Nadu", "12/A, North Street"},
                {"farmer2", "Selvaraj P", "9842223456", "farmer2@agriprocure.test", "Kinathukadavu", "Coimbatore", "Tamil Nadu", "45, East Garden"},
                {"farmer3", "Ramasamy G", "9842334567", "farmer3@agriprocure.test", "Kottur", "Coimbatore", "Tamil Nadu", "78, Temple Road"},
                {"farmer4", "Muruganandham S", "9842445678", "farmer4@agriprocure.test", "Vettaikaranpudur", "Coimbatore", "Tamil Nadu", "9, Farm House"},
                {"farmer5", "Velusamy T", "9842556789", "farmer5@agriprocure.test", "Negamam", "Coimbatore", "Tamil Nadu", "22, South Street"},
                {"farmer6", "Arunachalam N", "9842667890", "farmer6@agriprocure.test", "Zamin Uthukuli", "Coimbatore", "Tamil Nadu", "101, Canal Road"}
        };

        for (int i = 0; i < farmerData.length; i++) {
            String[] d = farmerData[i];
            String code = String.format("FAR-%06d", i + 1);
            User u = userRepository.save(new User(d[0], d[3], d[2], passwordEncoder.encode("Farmer@123"), Role.FARMER));
            Farmer f = farmerRepository.save(new Farmer(code, u, d[1], d[2], d[3], d[4], d[5], d[6], d[7]));
            farmers.add(f);
        }

        // 7. Seed Bookings & Queue Tokens in various realistic states
        // Booking 1: COMPLETED
        Booking b1 = bookingRepository.save(new Booking("BK-2026-000001", farmers.get(0), activeSlot1, paddy, new BigDecimal("45.00"), BookingStatus.COMPLETED));
        activeSlot1.setBookedCount(activeSlot1.getBookedCount() + 1);
        QueueToken t1 = queueTokenRepository.save(new QueueToken(1, "A-001", b1, farmers.get(0), pollachiCentre, today, QueueStatus.COMPLETED, 1));

        // Booking 2: APPROVED (Finished inspection)
        Booking b2 = bookingRepository.save(new Booking("BK-2026-000002", farmers.get(1), activeSlot1, paddy, new BigDecimal("60.00"), BookingStatus.CONFIRMED));
        activeSlot1.setBookedCount(activeSlot1.getBookedCount() + 1);
        QueueToken t2 = queueTokenRepository.save(new QueueToken(2, "A-002", b2, farmers.get(1), pollachiCentre, today, QueueStatus.APPROVED, 2));

        // Booking 3: WEIGHING
        Booking b3 = bookingRepository.save(new Booking("BK-2026-000003", farmers.get(2), activeSlot1, paddy, new BigDecimal("35.00"), BookingStatus.CONFIRMED));
        activeSlot1.setBookedCount(activeSlot1.getBookedCount() + 1);
        QueueToken t3 = queueTokenRepository.save(new QueueToken(3, "A-003", b3, farmers.get(2), pollachiCentre, today, QueueStatus.WEIGHING, 3));

        // Booking 4: WAITING
        Booking b4 = bookingRepository.save(new Booking("BK-2026-000004", farmers.get(3), activeSlot2, maize, new BigDecimal("50.00"), BookingStatus.CONFIRMED));
        activeSlot2.setBookedCount(activeSlot2.getBookedCount() + 1);
        QueueToken t4 = queueTokenRepository.save(new QueueToken(4, "A-004", b4, farmers.get(3), pollachiCentre, today, QueueStatus.WAITING, 4));

        // Booking 5: BOOKED
        Booking b5 = bookingRepository.save(new Booking("BK-2026-000005", farmers.get(4), activeSlot2, cotton, new BigDecimal("20.00"), BookingStatus.CONFIRMED));
        activeSlot2.setBookedCount(activeSlot2.getBookedCount() + 1);
        QueueToken t5 = queueTokenRepository.save(new QueueToken(5, "A-005", b5, farmers.get(4), pollachiCentre, today, QueueStatus.BOOKED, 5));

        slotRepository.save(activeSlot1);
        slotRepository.save(activeSlot2);

        // 8. Seed Historical & Active Procurements
        // Procurement 1: Completed with weighment, inspection, payment
        Procurement pr1 = new Procurement(
                "PR-2026-000001",
                farmers.get(0),
                t1,
                paddy,
                new BigDecimal("45.00"),
                new BigDecimal("44.80"),
                new BigDecimal("2300.00"),
                new BigDecimal("103040.00"),
                new BigDecimal("0.00"),
                new BigDecimal("103040.00"),
                ProcurementStatus.COMPLETED
        );
        pr1.setCompletedAt(Instant.now());
        pr1 = procurementRepository.save(pr1);

        weighmentRepository.save(new Weighment(pr1, new BigDecimal("45.00"), new BigDecimal("44.80"), new BigDecimal("12.50"), "operator", "Standard intake batch"));
        qualityInspectionRepository.save(new QualityInspection(pr1, QualityGrade.A, new BigDecimal("12.50"), new BigDecimal("0.50"), new BigDecimal("1.20"), "inspector_suresh", "Grade-A Certified", true));

        // Payment for PR-1: PAID
        paymentRepository.save(new Payment(
                "PAY-2026-000001",
                pr1,
                farmers.get(0),
                new BigDecimal("103040.00"),
                "DIRECT_BANK_TRANSFER",
                "TXN-2026-78945612",
                PaymentStatus.PAID
        ));

        // Procurement 2: Approved, Payment PENDING
        Procurement pr2 = new Procurement(
                "PR-2026-000002",
                farmers.get(1),
                t2,
                paddy,
                new BigDecimal("60.00"),
                new BigDecimal("59.50"),
                new BigDecimal("2300.00"),
                new BigDecimal("136850.00"),
                new BigDecimal("500.00"),
                new BigDecimal("136350.00"),
                ProcurementStatus.APPROVED
        );
        pr2 = procurementRepository.save(pr2);
        weighmentRepository.save(new Weighment(pr2, new BigDecimal("60.00"), new BigDecimal("59.50"), new BigDecimal("13.20"), "operator", "Net weight verified"));
        qualityInspectionRepository.save(new QualityInspection(pr2, QualityGrade.A, new BigDecimal("13.20"), new BigDecimal("0.80"), new BigDecimal("1.50"), "inspector_suresh", "Approved for DBT settlement", true));

        // Payment for PR-2: PENDING
        paymentRepository.save(new Payment(
                "PAY-2026-000002",
                pr2,
                farmers.get(1),
                new BigDecimal("136350.00"),
                "DIRECT_BANK_TRANSFER",
                null,
                PaymentStatus.PENDING
        ));

        // 9. Seed Sample Notifications
        notificationRepository.save(new Notification(farmers.get(0).getUser(), "Payment Disbursed: ₹103040.00", "Direct DBT settlement processed for Paddy procurement PR-2026-000001", NotificationType.PAYMENT));
        notificationRepository.save(new Notification(farmers.get(1).getUser(), "Quality Inspection Approved", "Your Paddy lot (59.50 Quintals) has passed Grade-A inspection", NotificationType.PROCUREMENT));
        notificationRepository.save(new Notification(farmers.get(2).getUser(), "Called for Weighment", "Please proceed to Weighbridge 1 with Token A-003", NotificationType.QUEUE));
        notificationRepository.save(new Notification(farmers.get(3).getUser(), "Queue Status Update", "You are at position 1 in the waiting line (Token A-004)", NotificationType.QUEUE));

        log.info("AGRIPROCURE database initialization completed successfully.");
    }
}
