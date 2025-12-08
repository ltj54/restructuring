package io.ltj.restructuring.api.controller;

import io.ltj.restructuring.api.dto.insurance.InsuranceRequestCreateDto;
import io.ltj.restructuring.api.dto.insurance.InsuranceRequestResponseDto;
import io.ltj.restructuring.application.insurance.InsuranceApplicationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import io.ltj.restructuring.security.JwtUserDetails;

import java.nio.charset.StandardCharsets;

@RestController
@RequestMapping("/api/insurance")
@Validated
public class InsuranceController {

    private static final Logger log = LoggerFactory.getLogger(InsuranceController.class);

    private final InsuranceApplicationService insuranceApplicationService;

    public InsuranceController(InsuranceApplicationService insuranceApplicationService) {
        this.insuranceApplicationService = insuranceApplicationService;
    }

    @PostMapping("/send")
    public ResponseEntity<ByteArrayResource> sendInsurance(
            @AuthenticationPrincipal JwtUserDetails principal) {
        if (principal == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Ingen bruker funnet for forespørselen.");
        }

        Long userId = principal.getId();
        log.atDebug()
                .addKeyValue("userId", userId)
                .log("Received insurance request");
        InsuranceRequestResponseDto response = insuranceApplicationService.generateInsuranceRequest(new InsuranceRequestCreateDto(userId));
        ByteArrayResource resource = new ByteArrayResource(response.xmlContent().getBytes(StandardCharsets.UTF_8));
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_XML)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + response.fileName())
                .body(resource);
    }
}

