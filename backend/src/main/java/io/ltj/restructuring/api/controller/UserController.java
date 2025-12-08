package io.ltj.restructuring.api.controller;

import io.ltj.restructuring.api.dto.user.UserResponseDto;
import io.ltj.restructuring.api.dto.user.UserUpdateRequestDto;
import io.ltj.restructuring.application.exception.ResourceNotFoundException;
import io.ltj.restructuring.application.user.UserApplicationService;
import io.ltj.restructuring.security.JwtUserDetails;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
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
    public ResponseEntity<UserResponseDto> getCurrentUser(
            @AuthenticationPrincipal JwtUserDetails principal
    ) {
        if (principal == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Ingen aktiv bruker.");
        }

        Long userId = principal.getId();

        return userApplicationService.findById(userId)
                .map(ResponseEntity::ok)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
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
            @AuthenticationPrincipal JwtUserDetails principal
    ) {
        if (principal == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Ingen aktiv bruker.");
        }

        Long userId = principal.getId();

        log.atDebug()
                .addKeyValue("userId", userId)
                .log("Updating profile information");

        UserResponseDto response = userApplicationService.updateUserInfo(userId, request);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<UserResponseDto> updateUserInfo(
            @PathVariable Long id,
            @Valid @RequestBody UserUpdateRequestDto request
    ) {
        log.atDebug()
                .addKeyValue("userId", id)
                .log("Updating profile information");

        return ResponseEntity.ok(userApplicationService.updateUserInfo(id, request));
    }
}
