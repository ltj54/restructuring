package io.ltj.restructuring.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.ltj.restructuring.api.dto.auth.LoginRequestDto;
import io.ltj.restructuring.api.dto.auth.RegisterRequestDto;
import io.ltj.restructuring.api.dto.plan.UserPlanUpdateRequestDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
public class FullFlowIntegrationTest {

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
                email, password, firstName, lastName
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
                .andReturn().getResponse().getContentAsString();

        String token = objectMapper.readTree(loginResp).get("token").asText();
        assertThat(token).isNotBlank();

        // -------------------------------------------------
        // 3) /api/user/me
        // -------------------------------------------------
        mockMvc.perform(get("/api/user/me")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(email));

        // -------------------------------------------------
        // 4) UPSERT plan
        // -------------------------------------------------
        UserPlanUpdateRequestDto planDto = new UserPlanUpdateRequestDto(
                "INTRO",
                "Standard persona",
                List.of("need1", "need2"),
                "My diary"
        );

        mockMvc.perform(put("/api/plan/me")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(planDto)))
                .andExpect(status().isOk());

        // -------------------------------------------------
        // 5) /api/insurance/send  (DIN KODE)
        // -------------------------------------------------
        String xmlResponse = mockMvc.perform(post("/api/insurance/send")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type", "application/xml"))
                .andExpect(header().string(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION,
                        org.hamcrest.Matchers.containsString("attachment; filename")))
                .andReturn()
                .getResponse()
                .getContentAsString();

        assertThat(xmlResponse).contains("<InsuranceRequest>");
    }
}
