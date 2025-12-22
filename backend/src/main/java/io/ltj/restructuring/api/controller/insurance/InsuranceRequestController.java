package io.ltj.restructuring.api.controller.insurance;

import io.ltj.restructuring.domain.insurance.InsuranceRequest;
import io.ltj.restructuring.domain.insurance.InsuranceRequestRepository;
import io.ltj.restructuring.security.JwtUserDetails;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/insurance")
public class InsuranceRequestController {

    private final InsuranceRequestRepository repository;

    public InsuranceRequestController(InsuranceRequestRepository repository) {
        this.repository = repository;
    }

    @PostMapping("/request")
    public InsuranceRequest submit(Authentication authentication) {

        if (authentication == null
                || !(authentication.getPrincipal() instanceof JwtUserDetails user)) {
            throw new IllegalStateException("No authenticated user");
        }

        /*
         * ⚠️ Viktig:
         * - IKKE bruk request-body som entity
         * - IKKE sett userId via setter
         * - Bruk domenets factory
         */

        // Midlertidig XML – kan byttes ut senere
        String xmlContent =
                "<insuranceRequest userId=\"" + user.getId() + "\"/>";

        InsuranceRequest request =
                InsuranceRequest.submitted(
                        user.getId(),
                        LocalDateTime.now(),
                        xmlContent
                );

        return repository.save(request);
    }
}
