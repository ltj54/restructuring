package io.ltj.restructuring.api.dto.plan;

import java.util.List;

public record UserPlanUpdateRequestDto(
        String persona,
        String phase,
        List<String> needs,
        String diary
) {
}

