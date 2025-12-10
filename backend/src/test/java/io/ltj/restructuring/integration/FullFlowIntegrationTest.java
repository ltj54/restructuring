package io.ltj.restructuring.integration;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.ltj.restructuring.api.dto.auth.LoginRequestDto;
import io.ltj.restructuring.api.dto.auth.RegisterRequestDto;
import io.ltj.restructuring.api.dto.plan.UserPlanUpdateRequestDto;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * FullFlowIntegrationTest
 *
 * Kjører en "happy path"-flyt gjennom:
 *  1) /api/auth/register
 *  2) /api/auth/login
 *  3) /api/user/me
 *  4) /api/plan/me (opprette / oppdatere plan)
 *  5) /api/plan/me (lese plan)
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles({"ci"})   // ← 🟢 NØKKELENDRINGEN
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class FullFlowIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private String email;
    private String password;
    private String firstName;
    private String lastName;

    @BeforeEach
    void setup() {
        email = "integrationtest@example.com";
        password = "secret123";
        firstName = "Testy";
        lastName = "McTestface";
    }

    @Test
    void fullFlow_shouldWorkCorrectly() throws Exception {
        // -------------------------------------------------
        // 1) REGISTER
        // -------------------------------------------------
        RegisterRequestDto regDto = new RegisterRequestDto(
                email,
                password,
                firstName,
                lastName
        );

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(regDto)))
                .andExpect(status().isCreated());

        // -------------------------------------------------
        // 2) LOGIN
        // -------------------------------------------------
        LoginRequestDto loginDto = new LoginRequestDto(email, password);

        String loginResp = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists())
                .andReturn()
                .getResponse()
                .getContentAsString();

        JsonNode loginJson = objectMapper.readTree(loginResp);
        String token = loginJson.get("token").asText();
        assertThat(token).isNotBlank();

        // -------------------------------------------------
        // 3) /api/user/me
        // -------------------------------------------------
        mockMvc.perform(get("/api/user/me")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(email));

        // -------------------------------------------------
        // 4) Oppdater /api/plan/me
        // -------------------------------------------------
        UserPlanUpdateRequestDto planUpdate = new UserPlanUpdateRequestDto(
                "DEFAULT",
                "PREPARE_CHANGE",
                List.of("need-1", "need-2"),
                "Dette er en test-dagbok for full-flow integrasjonstesten."
        );

        String planResp = mockMvc.perform(put("/api/plan/me")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(planUpdate)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.persona").value("DEFAULT"))
                .andExpect(jsonPath("$.phase").value("PREPARE_CHANGE"))
                .andReturn()
                .getResponse()
                .getContentAsString();

        JsonNode planJson = objectMapper.readTree(planResp);
        assertThat(planJson.get("persona").asText()).isEqualTo("DEFAULT");
        assertThat(planJson.get("phase").asText()).isEqualTo("PREPARE_CHANGE");

        // -------------------------------------------------
        // 5) Les /api/plan/me
        // -------------------------------------------------
        mockMvc.perform(get("/api/plan/me")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.persona").value("DEFAULT"))
                .andExpect(jsonPath("$.phase").value("PREPARE_CHANGE"));
    }
}
