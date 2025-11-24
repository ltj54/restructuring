package io.ltj.restructuring.api.dto.user;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UserUpdateRequestDto(
        @NotBlank(message = "firstName.required")
        @Size(max = 100, message = "firstName.tooLong")
        String firstName,

        @NotBlank(message = "lastName.required")
        @Size(max = 100, message = "lastName.tooLong")
        String lastName,

        @NotBlank(message = "ssn.required")
        @Pattern(regexp = "^\\d{11}$", message = "ssn.invalid")
        String ssn
) {
}
