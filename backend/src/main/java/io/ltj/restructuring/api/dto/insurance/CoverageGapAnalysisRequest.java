package io.ltj.restructuring.api.dto.insurance;

public record CoverageGapAnalysisRequest(
        int age,
        boolean hasChildren,
        boolean hasMortgage,
        int bufferMonths,
        boolean hasPrivateHealth,
        boolean hasPrivateDisability,
        boolean hasCriticalIllness,
        boolean hasTravel,
        boolean hasChildInsurance
) {
}
