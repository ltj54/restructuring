package io.ltj.restructuring.application.insurance;

import io.ltj.restructuring.api.dto.insurance.InsuranceSnapshotRequestDto;
import io.ltj.restructuring.domain.insurance.InsuranceSnapshotEntity;
import io.ltj.restructuring.domain.insurance.InsuranceSnapshotRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class InsuranceSnapshotService {

    private final InsuranceSnapshotRepository repository;

    public InsuranceSnapshotService(InsuranceSnapshotRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public void saveSnapshot(Long userId, InsuranceSnapshotRequestDto dto) {
        repository.deleteByUserId(userId);

        InsuranceSnapshotEntity entity =
                new InsuranceSnapshotEntity(
                        userId,
                        dto.getSource(),
                        dto.getTypes(),
                        dto.isUncertain()
                );

        repository.save(entity);
    }

    @Transactional(readOnly = true)
    public InsuranceSnapshotEntity getSnapshot(Long userId) {
        return repository.findByUserId(userId).orElse(null);
    }
}
