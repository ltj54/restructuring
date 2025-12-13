package io.ltj.restructuring.api.controller.insurance;

import io.ltj.restructuring.api.dto.insurance.InsuranceSnapshotRequestDto;
import io.ltj.restructuring.application.auth.AuthUser;
import io.ltj.restructuring.application.insurance.InsuranceSnapshotService;
import io.ltj.restructuring.domain.insurance.InsuranceSnapshotEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/insurance/snapshot")
public class InsuranceSnapshotController {

    private final InsuranceSnapshotService service;

    public InsuranceSnapshotController(InsuranceSnapshotService service) {
        this.service = service;
    }

    @PostMapping
    public void save(
            @AuthUser Long userId,
            @RequestBody InsuranceSnapshotRequestDto dto
    ) {
        service.saveSnapshot(userId, dto);
    }

    @GetMapping
    public InsuranceSnapshotEntity get(@AuthUser Long userId) {
        return service.getSnapshot(userId);
    }
}
