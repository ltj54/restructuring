package io.ltj.restructuring.api.dto.plan;

import java.time.Instant;
import java.util.List;
import java.util.Map;

public record UserPlanDto(
        String persona,
        String phase,
        List<String> needs,
        String diary,
        Map<String, String> diaries,
        Instant createdAt,
        Instant updatedAt
) {
}

