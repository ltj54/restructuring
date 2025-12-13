package io.ltj.restructuring.api.dto.insurance;

import java.util.List;

public record InsuranceProductDto(
        Long id,
        String name,
        String description,
        boolean canBuyPrivately,
        String providerName,
        String providerWebsite,
        List<String> categories
) {
}
