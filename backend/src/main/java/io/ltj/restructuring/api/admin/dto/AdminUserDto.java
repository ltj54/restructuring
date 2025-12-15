package io.ltj.restructuring.api.admin.dto;

import io.ltj.restructuring.domain.user.UserEntity;

public record AdminUserDto(
        Long id,
        String email,
        String firstName,
        String lastName,
        String role
) {
    public static AdminUserDto from(UserEntity user) {
        return new AdminUserDto(
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getRole()
        );
    }
}
