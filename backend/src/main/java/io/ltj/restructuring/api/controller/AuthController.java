package io.ltj.restructuring.api.controller;

import io.ltj.restructuring.api.dto.auth.LoginRequestDto;
import io.ltj.restructuring.api.dto.auth.LoginResponseDto;
import io.ltj.restructuring.api.dto.auth.RegisterRequestDto;
import io.ltj.restructuring.api.dto.auth.RegisterResponseDto;
import io.ltj.restructuring.application.auth.AuthService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@Validated
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    // --------------------------------------------------------------
    // 🔐 LOGIN
    // --------------------------------------------------------------
    @PostMapping("/login")
    public ResponseEntity<LoginResponseDto> login(@Valid @RequestBody LoginRequestDto request) {
        log.atDebug()
                .addKeyValue("email", request.email())
                .log("Received login request");

        LoginResponseDto response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    // --------------------------------------------------------------
    // 🆕 REGISTER
    // --------------------------------------------------------------
    @PostMapping("/register")
    public ResponseEntity<RegisterResponseDto> register(@Valid @RequestBody RegisterRequestDto request) {
        log.atDebug()
                .addKeyValue("email", request.email())
                .log("Attempting to register user");

        RegisterResponseDto response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // --------------------------------------------------------------
    // 🔄 REFRESH TOKEN (kan aktiveres dersom du ønsker)
    // --------------------------------------------------------------
    /*
    @PostMapping("/refresh")
    public ResponseEntity<TokenRefreshResponseDto> refresh(@Valid @RequestBody TokenRefreshRequestDto request) {
        TokenRefreshResponseDto response = authService.refreshToken(request);
        return ResponseEntity.ok(response);
    }
    */
}
