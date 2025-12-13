package io.ltj.restructuring.api.dto.insurance;

import java.util.List;

public record CoverageLossAnalysisResponse(
        List<Loss> losses
) {
    public record Loss(
            String area,
            String description,
            CoverageGapAnalysisResponse.Severity severity
    ) {
    }
}
