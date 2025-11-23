package io.ltj.restructuring.domain.insurance;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InsuranceRequestRepository extends JpaRepository<InsuranceRequest, Long> {
}
