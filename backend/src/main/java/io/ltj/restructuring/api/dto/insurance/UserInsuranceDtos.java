package io.ltj.restructuring.api.dto.insurance;

import java.time.LocalDate;

public class UserInsuranceDtos {

    public record RegisterUserInsuranceRequest(
            String source,        // EMPLOYER | PRIVATE | OTHER
            String providerName,
            String productName,
            LocalDate validFrom,
            LocalDate validTo,
            String notes
    ) {}

    public record UserInsuranceResponse(
            Long id,
            String source,
            String providerName,
            String productName,
            String notes,
            boolean active,
            LocalDate validFrom,
            LocalDate validTo
    ) {}
}
