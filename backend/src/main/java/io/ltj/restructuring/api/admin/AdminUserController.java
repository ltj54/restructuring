package io.ltj.restructuring.api.admin;

import io.ltj.restructuring.api.admin.dto.AdminUserDto;
import io.ltj.restructuring.domain.user.UserEntity;
import io.ltj.restructuring.domain.user.UserRepository;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final UserRepository userRepository;

    public AdminUserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // =========================
    // LIST USERS
    // =========================
    @GetMapping
    public List<AdminUserDto> getUsers() {
        return userRepository.findAll()
                .stream()
                .map(AdminUserDto::from)
                .toList();
    }

    // =========================
    // GET SINGLE USER
    // =========================
    @GetMapping("/{id}")
    public AdminUserDto getUser(@PathVariable Long id) {
        UserEntity user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + id));

        return AdminUserDto.from(user);
    }

    // =========================
    // PROMOTE TO ADMIN
    // =========================
    @PostMapping("/{id}/promote")
    public void promoteToAdmin(@PathVariable Long id) {
        UserEntity user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + id));

        user.setRole("ADMIN");
        userRepository.save(user);
    }

    // =========================
    // DEMOTE TO USER
    // =========================
    @PostMapping("/{id}/demote")
    public void demoteToUser(@PathVariable Long id) {
        UserEntity user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + id));

        user.setRole("USER");
        userRepository.save(user);
    }
}
