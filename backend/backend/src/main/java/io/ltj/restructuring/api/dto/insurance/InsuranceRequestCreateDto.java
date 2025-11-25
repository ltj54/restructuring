package io.ltj.restructuring.api.dto.insurance;

import jakarta.validation.constraints.NotNull;

public record InsuranceRequestCreateDto(
        @NotNull(message = "userId.required")
        Long userId
) {
}
