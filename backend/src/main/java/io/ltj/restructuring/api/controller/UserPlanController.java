package io.ltj.restructuring.api.controller;

import io.ltj.restructuring.api.dto.plan.UserPlanDto;
import io.ltj.restructuring.api.dto.plan.UserPlanUpdateRequestDto;
import io.ltj.restructuring.application.plan.UserPlanApplicationService;
import io.ltj.restructuring.security.userdetails.UserPrincipal;
import java.util.Optional;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/plan")
@Validated
public class UserPlanController {

    private final UserPlanApplicationService userPlanApplicationService;

    public UserPlanController(UserPlanApplicationService userPlanApplicationService) {
        this.userPlanApplicationService = userPlanApplicationService;
    }

    @GetMapping("/me")
    public ResponseEntity<UserPlanDto> getMyPlan(@AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Ingen aktiv bruker.");
        }

        Optional<UserPlanDto> result = userPlanApplicationService.getPlanForUser(principal.getId());
        return result.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.noContent().build());
    }

    @PutMapping("/me")
    public ResponseEntity<UserPlanDto> upsertMyPlan(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody UserPlanUpdateRequestDto request
    ) {
        if (principal == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Ingen aktiv bruker.");
        }

        UserPlanDto saved = userPlanApplicationService.upsertPlanForUser(principal.getId(), request);
        return ResponseEntity.ok(saved);
    }
}

