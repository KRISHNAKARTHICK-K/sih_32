package com.agriprocure;

import com.agriprocure.dto.LoginRequest;
import com.agriprocure.dto.SlotCreateRequest;
import com.agriprocure.entity.Farmer;
import com.agriprocure.entity.ProcurementCentre;
import com.agriprocure.repository.CropRepository;
import com.agriprocure.repository.FarmerRepository;
import com.agriprocure.repository.ProcurementCentreRepository;
import com.agriprocure.repository.SlotRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AuthAndSecurityIntegrationTest {

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

    private String obtainAccessToken(String username, String password) throws Exception {
        LoginRequest loginRequest = new LoginRequest(username, password);
        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode responseNode = objectMapper.readTree(result.getResponse().getContentAsString());
        return responseNode.get("data").get("accessToken").asText();
    }

    @Test
    @DisplayName("Test 1: Public Health API accessible without JWT")
    void testPublicHealth() throws Exception {
        mockMvc.perform(get("/api/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"))
                .andExpect(jsonPath("$.service").value("AGRIPROCURE"));
    }

    @Test
    @DisplayName("Test 2: Login with valid credentials returns JWT and user profile")
    void testValidLogin() throws Exception {
        LoginRequest request = new LoginRequest("admin", "Admin@123");
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.accessToken").isString())
                .andExpect(jsonPath("$.data.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.data.user.username").value("admin"))
                .andExpect(jsonPath("$.data.user.role").value("ADMIN"));
    }

    @Test
    @DisplayName("Test 3: Invalid login returns 401 Unauthorized with generic error")
    void testInvalidLogin() throws Exception {
        LoginRequest request = new LoginRequest("admin", "WrongPassword999");
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.error").value("Unauthorized"))
                .andExpect(jsonPath("$.message").value("Invalid username or password"));
    }

    @Test
    @DisplayName("Test 4: Protected API without token returns 401 Unauthorized")
    void testProtectedApiWithoutToken() throws Exception {
        mockMvc.perform(get("/api/farmers"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.error").value("Unauthorized"));
    }

    @Test
    @DisplayName("Test 5: /api/auth/me returns authenticated farmer details")
    void testFarmerAuthMe() throws Exception {
        String token = obtainAccessToken("farmer1", "Farmer@123");
        mockMvc.perform(get("/api/auth/me")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.username").value("farmer1"))
                .andExpect(jsonPath("$.data.role").value("FARMER"))
                .andExpect(jsonPath("$.data.farmerCode").value("FAR-000001"));
    }

    @Test
    @DisplayName("Test 6: Farmer accessing own booking is allowed (200), accessing other farmer is 403")
    void testFarmerOwnershipSecurity() throws Exception {
        List<Farmer> farmers = farmerRepository.findAll();
        Farmer farmer1 = farmers.get(0);
        Farmer farmer2 = farmers.get(1);

        String farmer1Token = obtainAccessToken("farmer1", "Farmer@123");

        // Farmer 1 accessing own bookings -> 200 OK
        mockMvc.perform(get("/api/farmers/" + farmer1.getId() + "/bookings")
                        .header("Authorization", "Bearer " + farmer1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        // Farmer 1 attempting to access Farmer 2's bookings -> 403 Forbidden
        mockMvc.perform(get("/api/farmers/" + farmer2.getId() + "/bookings")
                        .header("Authorization", "Bearer " + farmer1Token))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403))
                .andExpect(jsonPath("$.error").value("Forbidden"));
    }

    @Test
    @DisplayName("Test 7: Farmer attempting Admin operation (create crop) returns 403 Forbidden")
    void testFarmerAttemptingAdminOperation() throws Exception {
        String farmer1Token = obtainAccessToken("farmer1", "Farmer@123");

        mockMvc.perform(post("/api/crops")
                        .header("Authorization", "Bearer " + farmer1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403));
    }

    @Test
    @DisplayName("Test 8 & 9: Centre restriction (Operator / Manager accessing assigned vs unassigned centre)")
    void testCentreRestrictions() throws Exception {
        List<ProcurementCentre> centres = centreRepository.findAll();
        ProcurementCentre pollachi = centres.stream().filter(c -> c.getCentreCode().equals("PC-001")).findFirst().get();
        ProcurementCentre coimbatore = centres.stream().filter(c -> c.getCentreCode().equals("PC-002")).findFirst().get();

        String managerToken = obtainAccessToken("manager", "Manager@123");

        // Manager assigned to Pollachi PC-001 creating slot at PC-001 -> 201 Created
        SlotCreateRequest validRequest = new SlotCreateRequest(
                pollachi.getId(),
                LocalDate.now().plusDays(10),
                LocalTime.of(8, 0),
                LocalTime.of(10, 0),
                20
        );

        mockMvc.perform(post("/api/centres/" + pollachi.getId() + "/slots")
                        .header("Authorization", "Bearer " + managerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true));

        // Manager assigned to Pollachi attempting to create slot at Coimbatore PC-002 -> 403 Forbidden
        SlotCreateRequest invalidRequest = new SlotCreateRequest(
                coimbatore.getId(),
                LocalDate.now().plusDays(10),
                LocalTime.of(8, 0),
                LocalTime.of(10, 0),
                20
        );

        mockMvc.perform(post("/api/centres/" + coimbatore.getId() + "/slots")
                        .header("Authorization", "Bearer " + managerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403));
    }

    @Test
    @DisplayName("Test 10: Admin accesses system-wide resources successfully")
    void testAdminAccess() throws Exception {
        String adminToken = obtainAccessToken("admin", "Admin@123");

        mockMvc.perform(get("/api/farmers")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray());
    }
}
