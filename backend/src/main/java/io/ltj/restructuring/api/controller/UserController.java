package io.ltj.restructuring.api.controller;

import io.ltj.restructuring.api.dto.user.UserResponseDto;
import io.ltj.restructuring.api.dto.user.UserUpdateRequestDto;
import io.ltj.restructuring.application.exception.ResourceNotFoundException;
import io.ltj.restructuring.application.user.UserApplicationService;
import jakarta.validation.Valid;
import io.ltj.restructuring.security.userdetails.UserPrincipal;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/user")
@Validated
public class UserController {

    private static final Logger log = LoggerFactory.getLogger(UserController.class);

    private final UserApplicationService userApplicationService;

    public UserController(UserApplicationService userApplicationService) {
        this.userApplicationService = userApplicationService;
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponseDto> getCurrentUser(@AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Ingen aktiv bruker.");
        }

        return userApplicationService.findById(principal.getId())
                .map(ResponseEntity::ok)
                .orElseThrow(() -> new ResourceNotFoundException("User", principal.getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponseDto> getUserById(@PathVariable Long id) {
        return userApplicationService.findById(id)
                .map(ResponseEntity::ok)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));
    }

    @PutMapping("/me")
    public ResponseEntity<UserResponseDto> updateCurrentUser(
            @Valid @RequestBody UserUpdateRequestDto request,
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Ingen aktiv bruker.");
        }

        log.atDebug()
                .addKeyValue("userId", principal.getId())
                .log("Updating profile information");

        UserResponseDto response = userApplicationService.updateUserInfo(principal.getId(), request);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<UserResponseDto> updateUserInfo(
            @PathVariable Long id,
            @Valid @RequestBody UserUpdateRequestDto request) {

        log.atDebug()
                .addKeyValue("userId", id)
                .log("Updating profile information");
        UserResponseDto response = userApplicationService.updateUserInfo(id, request);
        return ResponseEntity.ok(response);
    }
}
