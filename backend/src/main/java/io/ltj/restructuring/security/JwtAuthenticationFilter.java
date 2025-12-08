package io.ltj.restructuring.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.ltj.restructuring.domain.user.UserEntity;
import io.ltj.restructuring.domain.user.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.util.Collections;
import java.util.Optional;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(JwtAuthenticationFilter.class);
    private final JwtDecoder jwtDecoder;
    private final UserRepository userRepository;

    public JwtAuthenticationFilter(JwtDecoder jwtDecoder, UserRepository userRepository) {
        this.jwtDecoder = jwtDecoder;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String authorization = request.getHeader(HttpHeaders.AUTHORIZATION);

        if (authorization != null && authorization.startsWith("Bearer ")) {
            String token = authorization.substring(7);

            try {
                Claims claims = jwtDecoder.decode(token);

                Long userId = claims.get("userId", Long.class);
                String email = claims.getSubject();

                if (email != null &&
                        userId != null &&
                        SecurityContextHolder.getContext().getAuthentication() == null) {

                    Optional<UserEntity> userOpt = userRepository.findById(userId);
                    if (userOpt.isEmpty() || !email.equalsIgnoreCase(userOpt.get().getEmail())) {
                        log.atWarn()
                                .addKeyValue("userId", userId)
                                .addKeyValue("email", email)
                                .log("JWT rejected because user no longer exists or email mismatch");
                        filterChain.doFilter(request, response);
                        return;
                    }

                    JwtUserDetails userDetails = new JwtUserDetails(
                            userId,
                            userOpt.get().getEmail(),
                            Collections.emptyList()
                    );

                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails,
                                    null,
                                    userDetails.getAuthorities()
                            );

                    authentication.setDetails(
                            new WebAuthenticationDetailsSource().buildDetails(request)
                    );

                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }

            } catch (JwtException | IllegalArgumentException ex) {
                log.atWarn()
                        .addKeyValue("reason", ex.getMessage())
                        .log("Invalid JWT token");
            }
        }

        filterChain.doFilter(request, response);
    }
}
