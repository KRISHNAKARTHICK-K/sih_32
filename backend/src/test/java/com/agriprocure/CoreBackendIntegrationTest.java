package com.agriprocure;

import com.agriprocure.dto.BookingCreateRequest;
import com.agriprocure.dto.LoginRequest;
import com.agriprocure.entity.Crop;
import com.agriprocure.entity.Farmer;
import com.agriprocure.entity.ProcurementCentre;
import com.agriprocure.entity.Slot;
import com.agriprocure.repository.CropRepository;
import com.agriprocure.repository.FarmerRepository;
import com.agriprocure.repository.ProcurementCentreRepository;
import com.agriprocure.repository.SlotRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
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

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class CoreBackendIntegrationTest {

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

    private String getAdminToken() throws Exception {
        LoginRequest loginRequest = new LoginRequest("admin", "Admin@123");
        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode responseNode = objectMapper.readTree(result.getResponse().getContentAsString());
        return responseNode.get("data").get("accessToken").asText();
    }

    private String getFarmerToken() throws Exception {
        LoginRequest loginRequest = new LoginRequest("farmer1", "Farmer@123");
        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode responseNode = objectMapper.readTree(result.getResponse().getContentAsString());
        return responseNode.get("data").get("accessToken").asText();
    }

    @Test
    void testGetFarmers() throws Exception {
        String token = getAdminToken();
        mockMvc.perform(get("/api/farmers")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    void testGetCentres() throws Exception {
        mockMvc.perform(get("/api/centres"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    void testGetCrops() throws Exception {
        mockMvc.perform(get("/api/crops"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].code").value("PADDY"));
    }

    @Test
    void testCreateBookingAndTokenGeneration() throws Exception {
        List<Farmer> farmers = farmerRepository.findAll();
        List<Crop> crops = cropRepository.findAll();
        List<ProcurementCentre> centres = centreRepository.findAll();

        Slot testSlot = slotRepository.save(new Slot(
                centres.get(0),
                LocalDate.now().plusDays(5),
                LocalTime.of(10, 0),
                LocalTime.of(12, 0),
                10
        ));

        BookingCreateRequest request = new BookingCreateRequest(
                farmers.get(0).getId(),
                testSlot.getId(),
                crops.get(0).getId(),
                new BigDecimal("30.00")
        );

        String farmerToken = getFarmerToken();
        mockMvc.perform(post("/api/bookings")
                        .header("Authorization", "Bearer " + farmerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.bookingCode").exists())
                .andExpect(jsonPath("$.data.queueToken").exists())
                .andExpect(jsonPath("$.data.status").value("CONFIRMED"));
    }
}
