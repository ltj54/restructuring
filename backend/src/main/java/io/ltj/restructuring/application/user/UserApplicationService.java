package io.ltj.restructuring.application.user;

import io.ltj.restructuring.api.dto.user.UserResponseDto;
import io.ltj.restructuring.api.dto.user.UserUpdateRequestDto;
import io.ltj.restructuring.application.exception.ResourceNotFoundException;
import io.ltj.restructuring.domain.user.UserEntity;
import io.ltj.restructuring.domain.user.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.Clock;
import java.time.Instant;
import java.util.Optional;

@Service
public class UserApplicationService {

    private static final Logger log = LoggerFactory.getLogger(UserApplicationService.class);

    private final UserRepository userRepository;
    private final Clock clock;

    public UserApplicationService(UserRepository userRepository, Clock clock) {
        this.userRepository = userRepository;
        this.clock = clock;
    }

    public UserEntity save(UserEntity user) {
        Instant now = Instant.now(clock);
        if (user.getCreatedAt() == null) {
            user.setCreatedAt(now);
        }
        user.setUpdatedAt(now);
        return userRepository.save(user);
    }

    public UserEntity findByEmail(String email) {
        return userRepository.findByEmail(email).orElse(null);
    }

    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    public Optional<UserResponseDto> findById(Long id) {
        return userRepository.findById(id).map(this::mapToDto);
    }

    public UserResponseDto updateUserInfo(Long id, UserUpdateRequestDto request) {
        UserEntity user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));

        user.setFirstName(request.firstName());
        user.setLastName(request.lastName());
        user.setSsn(request.ssn());
        user.setUpdatedAt(Instant.now(clock));

        UserEntity saved = userRepository.save(user);
        log.atInfo()
                .addKeyValue("userId", saved.getId())
                .log("Updated user info");
        return mapToDto(saved);
    }

    private UserResponseDto mapToDto(UserEntity user) {
        return new UserResponseDto(
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getSsn()
        );
    }
}
