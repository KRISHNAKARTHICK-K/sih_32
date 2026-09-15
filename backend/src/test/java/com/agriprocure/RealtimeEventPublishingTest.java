package com.agriprocure;

import com.agriprocure.dto.*;
import com.agriprocure.entity.*;
import com.agriprocure.repository.CropRepository;
import com.agriprocure.repository.FarmerRepository;
import com.agriprocure.repository.ProcurementCentreRepository;
import com.agriprocure.repository.QueueTokenRepository;
import com.agriprocure.repository.SlotRepository;
import com.agriprocure.websocket.WebSocketEventPublisher;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class RealtimeEventPublishingTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private FarmerRepository farmerRepository;

    @Autowired
    private SlotRepository slotRepository;

    @Autowired
    private CropRepository cropRepository;

    @Autowired
    private ProcurementCentreRepository centreRepository;

    @Autowired
    private QueueTokenRepository queueTokenRepository;

    @Autowired
    private WebSocketEventPublisher eventPublisher;

    private String farmerToken;
    private String operatorToken;
    private Farmer farmer;
    private Crop crop;
    private Slot slot;

    @BeforeEach
    void setUp() throws Exception {
        eventPublisher.clearRecentPublishedEvents();

        LoginRequest farmerLogin = new LoginRequest("farmer1", "Farmer@123");
        MvcResult fRes = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(farmerLogin)))
                .andExpect(status().isOk())
                .andReturn();
        farmerToken = objectMapper.readTree(fRes.getResponse().getContentAsString())
                .path("data").path("accessToken").asText();

        LoginRequest opLogin = new LoginRequest("operator", "Operator@123");
        MvcResult opRes = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(opLogin)))
                .andExpect(status().isOk())
                .andReturn();
        operatorToken = objectMapper.readTree(opRes.getResponse().getContentAsString())
                .path("data").path("accessToken").asText();

        farmer = farmerRepository.findAll().get(0);
        crop = cropRepository.findAll().get(0);
        ProcurementCentre centre = centreRepository.findAll().get(0);

        slot = slotRepository.save(new Slot(
                centre,
                LocalDate.now().plusDays(10),
                LocalTime.of(9, 0),
                LocalTime.of(10, 0),
                2
        ));
    }

    @Test
    void testBookingCreated_PublishesEventAfterCommit() throws Exception {
        eventPublisher.clearRecentPublishedEvents();

        BookingCreateRequest request = new BookingCreateRequest();
        request.setFarmerId(farmer.getId());
        request.setCropId(crop.getId());
        request.setSlotId(slot.getId());
        request.setDeclaredQuantity(new BigDecimal("15.5"));

        mockMvc.perform(post("/api/bookings")
                        .header("Authorization", "Bearer " + farmerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

        List<RealtimeEvent> events = eventPublisher.getRecentPublishedEvents();
        assertThat(events).isNotEmpty();

        RealtimeEvent bookingEvent = events.stream()
                .filter(e -> e.getEventType() == RealtimeEventType.BOOKING_CREATED)
                .findFirst()
                .orElse(null);

        assertThat(bookingEvent).isNotNull();
        assertThat(bookingEvent.getTimestamp()).isNotNull();
        assertThat(bookingEvent.getEntityId()).isNotNull();
        assertThat(bookingEvent.getEntityType()).isEqualTo("BOOKING");
        assertThat(bookingEvent.getPayload()).isInstanceOf(BookingResponse.class);

        BookingResponse br = (BookingResponse) bookingEvent.getPayload();
        assertThat(br.getBookingCode()).isNotBlank();
        assertThat(br.getFarmerName()).isEqualTo(farmer.getFullName());
    }

    @Test
    void testFailedBooking_DoesNotPublishBookingCreatedEvent() throws Exception {
        Slot fullSlot = slotRepository.save(new Slot(
                slot.getCentre(),
                LocalDate.now().plusDays(11),
                LocalTime.of(11, 0),
                LocalTime.of(12, 0),
                0
        ));

        eventPublisher.clearRecentPublishedEvents();

        BookingCreateRequest badRequest = new BookingCreateRequest();
        badRequest.setFarmerId(farmer.getId());
        badRequest.setCropId(crop.getId());
        badRequest.setSlotId(fullSlot.getId());
        badRequest.setDeclaredQuantity(new BigDecimal("10.0"));

        // Must fail with 409 Conflict
        mockMvc.perform(post("/api/bookings")
                        .header("Authorization", "Bearer " + farmerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(badRequest)))
                .andExpect(status().isConflict());

        // Zero booking events should be emitted
        boolean hasBookingEvent = eventPublisher.getRecentPublishedEvents().stream()
                .anyMatch(e -> e.getEventType() == RealtimeEventType.BOOKING_CREATED);
        assertThat(hasBookingEvent).isFalse();
    }

    @Test
    void testQueueTokenStatusUpdate_PublishesTokenStatusChanged() throws Exception {
        QueueToken targetToken = queueTokenRepository.findAll().stream()
                .filter(t -> t.getStatus() != QueueStatus.COMPLETED && t.getStatus() != QueueStatus.CANCELLED)
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("No active token found"));

        eventPublisher.clearRecentPublishedEvents();

        QueueStatusUpdateRequest updateRequest = new QueueStatusUpdateRequest();
        updateRequest.setStatus(QueueStatus.PROCESSING);

        mockMvc.perform(patch("/api/queues/tokens/" + targetToken.getId() + "/status")
                        .header("Authorization", "Bearer " + operatorToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk());

        boolean foundTokenStatusChanged = eventPublisher.getRecentPublishedEvents().stream()
                .anyMatch(e -> e.getEventType() == RealtimeEventType.TOKEN_STATUS_CHANGED);
        assertThat(foundTokenStatusChanged).isTrue();
    }
}
