package io.ltj.restructuring.application.insurance;

import io.ltj.restructuring.api.dto.insurance.UserInsuranceDtos.UserInsuranceResponse;
import io.ltj.restructuring.api.dto.insurance.UserInsuranceDtos.RegisterUserInsuranceRequest;
import io.ltj.restructuring.domain.insurance.UserInsuranceProfile;
import io.ltj.restructuring.domain.insurance.UserInsuranceProfileRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Locale;

@Service
public class UserInsuranceProfileService {

    private final UserInsuranceProfileRepository repository;

    public UserInsuranceProfileService(UserInsuranceProfileRepository repository) {
        this.repository = repository;
    }

    // -------- CREATE --------

    public void register(Long userId, RegisterUserInsuranceRequest req) {
        UserInsuranceProfile.Source source = parseSource(req.source());
        UserInsuranceProfile profile = new UserInsuranceProfile(
                userId,
                source,
                req.providerName(),
                req.productName(),
                req.notes(),
                req.validFrom(),
                req.validTo()
        );
        repository.save(profile);
    }

    // -------- READ --------

    public List<UserInsuranceResponse> getForUser(Long userId) {
        return repository.findByUserIdOrderByIdDesc(userId)
                .stream()
                .map(this::toDto)
                .toList();
    }

    private UserInsuranceResponse toDto(UserInsuranceProfile p) {
        return new UserInsuranceResponse(
                p.getId(),
                p.getSource().name(),
                p.getProviderName(),
                p.getProductName(),
                p.getNotes(),
                p.isActive(),
                p.getValidFrom(),
                p.getValidTo()
        );
    }

    private UserInsuranceProfile.Source parseSource(String value) {
        if (value == null) {
            throw new IllegalArgumentException("source is required");
        }
        try {
            return UserInsuranceProfile.Source.valueOf(value.toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("Invalid source: " + value);
        }
    }
}
