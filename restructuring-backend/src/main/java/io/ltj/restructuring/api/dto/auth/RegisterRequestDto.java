package io.ltj.restructuring.api.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequestDto(

        @Email
        @NotBlank
        String email,

        @NotBlank
        @Size(min = 8, message = "Password must be at least 8 characters")
        String password,

        // Optional – ingen validering
        String firstName,

        // Optional – ingen validering
        String lastName
) {}
