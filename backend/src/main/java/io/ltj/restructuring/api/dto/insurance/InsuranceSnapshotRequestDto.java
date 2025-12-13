package io.ltj.restructuring.api.dto.insurance;

import io.ltj.restructuring.domain.insurance.InsuranceSource;
import io.ltj.restructuring.domain.insurance.InsuranceType;

import java.util.Set;

public class InsuranceSnapshotRequestDto {

    private InsuranceSource source;
    private Set<InsuranceType> types;
    private boolean uncertain;

    public InsuranceSource getSource() {
        return source;
    }

    public void setSource(InsuranceSource source) {
        this.source = source;
    }

    public Set<InsuranceType> getTypes() {
        return types;
    }

    public void setTypes(Set<InsuranceType> types) {
        this.types = types;
    }

    public boolean isUncertain() {
        return uncertain;
    }

    public void setUncertain(boolean uncertain) {
        this.uncertain = uncertain;
    }
}
