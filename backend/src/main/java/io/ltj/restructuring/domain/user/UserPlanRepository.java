package io.ltj.restructuring.domain.user;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserPlanRepository extends JpaRepository<UserPlanEntity, Long> {

    Optional<UserPlanEntity> findByUserId(Long userId);
}

