package io.ltj.restructuring.api.dto.auth;

public record LoginResponseDto(
        String token,
        String tokenType,
        long expiresInSeconds,
        Long userId,
        String email,
        String firstName,
        String lastName
) {}
