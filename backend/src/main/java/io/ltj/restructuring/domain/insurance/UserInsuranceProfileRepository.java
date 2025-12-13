package io.ltj.restructuring.domain.insurance;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface UserInsuranceProfileRepository
        extends JpaRepository<UserInsuranceProfile, Long> {

    List<UserInsuranceProfile> findByUserIdOrderByIdDesc(Long userId);
}
