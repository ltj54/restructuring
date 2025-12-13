package io.ltj.restructuring.api.dto.insurance;

import java.util.List;

public record CoverageGapAnalysisResponse(
        List<CoverageGap> gaps
) {

    public record CoverageGap(
            String area,
            Severity severity,
            String description,
            String currentSituation,
            String recommendedAction,
            List<RecommendedProduct> recommendedProducts
    ) {
    }

    public record RecommendedProduct(
            Long id,
            String name,
            String provider
    ) {
    }

    public enum Severity {
        CRITICAL,
        HIGH,
        MEDIUM,
        LOW
    }
}
