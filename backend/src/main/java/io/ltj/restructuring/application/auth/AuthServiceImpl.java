package io.ltj.restructuring.application.auth;

import io.ltj.restructuring.api.dto.auth.LoginRequestDto;
import io.ltj.restructuring.api.dto.auth.LoginResponseDto;
import io.ltj.restructuring.api.dto.auth.RegisterRequestDto;
import io.ltj.restructuring.api.dto.auth.RegisterResponseDto;
import io.ltj.restructuring.domain.user.UserEntity;
import io.ltj.restructuring.domain.user.UserRepository;
import io.ltj.restructuring.security.JwtUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AuthServiceImpl implements AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthServiceImpl.class);
    private static final String EMAIL_KEY = "email";

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthServiceImpl(AuthenticationManager authenticationManager,
                           UserRepository userRepository,
                           PasswordEncoder passwordEncoder,
                           JwtUtil jwtUtil) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    // -------------------------------------------------------------
    // 🔐 LOGIN
    // -------------------------------------------------------------
    @Override
    public LoginResponseDto login(LoginRequestDto request) {
        String email = request.email();

        Authentication auth;
        try {
            auth = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, request.password())
            );

            log.atDebug()
                    .addKeyValue(EMAIL_KEY, email)
                    .log("User authenticated successfully");

        } catch (BadCredentialsException ex) {
            log.atWarn()
                    .addKeyValue(EMAIL_KEY, email)
                    .log("Invalid credentials");
            throw ex;
        }

        UserDetails principal = (UserDetails) auth.getPrincipal();

        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("USER_NOT_FOUND"));

        // ⭐ Now includes userId + email
        String token = jwtUtil.generateToken(user.getId(), user.getEmail());
        long expiresInSeconds = 60L * 60L * 24L; // 24h

        return new LoginResponseDto(
                token,
                "Bearer",
                expiresInSeconds,
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName()
        );
    }

    // -------------------------------------------------------------
    // 🆕 REGISTER
    // -------------------------------------------------------------
    @Override
    public RegisterResponseDto register(RegisterRequestDto request) {
        String email = request.email();

        if (userRepository.existsByEmail(email)) {
            log.atWarn()
                    .addKeyValue(EMAIL_KEY, email)
                    .log("Attempt to register existing email");

            throw new UserAlreadyExistsException(email);
        }

        UserEntity user = new UserEntity();
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.password()));

        // Optional
        user.setFirstName(request.firstName());
        user.setLastName(request.lastName());

        UserEntity saved = userRepository.save(user);

        log.atInfo()
                .addKeyValue("userId", saved.getId())
                .addKeyValue(EMAIL_KEY, saved.getEmail())
                .log("User registered successfully");

        return new RegisterResponseDto(
                saved.getId(),
                saved.getEmail(),
                saved.getFirstName(),
                saved.getLastName()
        );
    }
}
