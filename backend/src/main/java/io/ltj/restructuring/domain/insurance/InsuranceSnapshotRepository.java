package io.ltj.restructuring.domain.insurance;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface InsuranceSnapshotRepository
        extends JpaRepository<InsuranceSnapshotEntity, Long> {

    Optional<InsuranceSnapshotEntity> findByUserId(Long userId);

    void deleteByUserId(Long userId);
}
