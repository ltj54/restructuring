package io.ltj.restructuring.api.dto.auth;

public record RegisterResponseDto(
        Long id,
        String email,
        String firstName,
        String lastName
) {}
