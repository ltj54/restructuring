package io.ltj.restructuring.api.controller;

import io.ltj.restructuring.api.dto.insurance.InsuranceProductDto;
import io.ltj.restructuring.api.dto.insurance.InsuranceRequestCreateDto;
import io.ltj.restructuring.api.dto.insurance.InsuranceRequestResponseDto;
import io.ltj.restructuring.api.dto.insurance.UserInsuranceDtos.RegisterUserInsuranceRequest;
import io.ltj.restructuring.api.dto.insurance.UserInsuranceDtos.UserInsuranceResponse;
import io.ltj.restructuring.application.insurance.InsuranceApplicationService;
import io.ltj.restructuring.application.insurance.InsuranceCatalogService;
import io.ltj.restructuring.application.insurance.UserInsuranceProfileService;
import io.ltj.restructuring.security.JwtUserDetails;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
@RequestMapping("/api/insurance")
@Validated
public class InsuranceController {

    private static final Logger log = LoggerFactory.getLogger(InsuranceController.class);

    private final InsuranceApplicationService insuranceApplicationService;
    private final InsuranceCatalogService insuranceCatalogService;
    private final UserInsuranceProfileService userInsuranceProfileService;

    public InsuranceController(
            InsuranceApplicationService insuranceApplicationService,
            InsuranceCatalogService insuranceCatalogService,
            UserInsuranceProfileService userInsuranceProfileService
    ) {
        this.insuranceApplicationService = insuranceApplicationService;
        this.insuranceCatalogService = insuranceCatalogService;
        this.userInsuranceProfileService = userInsuranceProfileService;
    }

    // --------------------------------------------------
    // KATALOG
    // --------------------------------------------------

    @GetMapping("/products")
    public List<InsuranceProductDto> getProducts() {
        return insuranceCatalogService.getAllProducts();
    }

    // --------------------------------------------------
    // MINE FORSIKRINGER
    // --------------------------------------------------

    @GetMapping("/my")
    public List<UserInsuranceResponse> getMyInsurances(
            @AuthenticationPrincipal JwtUserDetails principal
    ) {
        if (principal == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }

        return userInsuranceProfileService.getForUser(principal.getId());
    }

    @PostMapping("/my")
    public ResponseEntity<Void> registerMyInsurance(
            @AuthenticationPrincipal JwtUserDetails principal,
            @RequestBody RegisterUserInsuranceRequest request
    ) {
        if (principal == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }

        try {
            userInsuranceProfileService.register(principal.getId(), request);
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, ex.getMessage());
        }
        return ResponseEntity.ok().build();
    }

    // --------------------------------------------------
    // SEND INSURANCE REQUEST (PDF / XML)
    // --------------------------------------------------

    @PostMapping("/send")
    public ResponseEntity<ByteArrayResource> sendInsurance(
            @AuthenticationPrincipal JwtUserDetails principal
    ) {
        if (principal == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }

        Long userId = principal.getId();

        log.debug("Received insurance request for user {}", userId);

        InsuranceRequestResponseDto response =
                insuranceApplicationService.generateInsuranceRequest(
                        new InsuranceRequestCreateDto(userId)
                );

        ByteArrayResource resource =
                new ByteArrayResource(
                        response.xmlContent().getBytes(StandardCharsets.UTF_8)
                );

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_XML)
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=" + response.fileName()
                )
                .body(resource);
    }
}
