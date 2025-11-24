package io.ltj.restructuring.api.dto.insurance;

import java.time.LocalDateTime;
import io.ltj.restructuring.domain.insurance.InsuranceRequestStatus;

public record InsuranceRequestResponseDto(
        Long requestId,
        Long userId,
        LocalDateTime createdAt,
        InsuranceRequestStatus status,
        String xmlContent,
        String fileName
) {}
