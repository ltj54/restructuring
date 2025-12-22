package io.ltj.restructuring.config;

import io.ltj.restructuring.security.JwtAuthenticationFilter;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                // Stateless API -> CSRF off
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // 🔴 VIKTIG: API-vennlig feilhåndtering (INGEN HTML)
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((request, response, authException) -> {
                            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                            response.setContentType("application/json");
                            response.getWriter()
                                    .write("{\"error\":\"unauthorized\"}");
                        })
                )

                .authorizeHttpRequests(auth -> auth

                        // =====================
                        // PUBLIC ENDPOINTS
                        // =====================
                        .requestMatchers(
                                "/api/hello",
                                "/api/health",
                                "/favicon.ico"
                        ).permitAll()

                        // Platform probes
                        .requestMatchers(
                                "/actuator/health",
                                "/actuator/health/**"
                        ).permitAll()

                        // Frontend logging
                        .requestMatchers(HttpMethod.POST, "/api/log").permitAll()

                        // Public read of plan (returns 204 when anonymous)
                        .requestMatchers(HttpMethod.GET, "/api/plan/me").permitAll()

                        // Auth endpoints
                        .requestMatchers(HttpMethod.POST, "/api/auth/login").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/auth/register").permitAll()

                        // OPTIONS for CORS
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // =====================
                        // ADMIN / SYSTEM
                        // =====================
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")

                        .requestMatchers(
                                "/api/config",
                                "/api/dbinfo",
                                "/api/dbversion"
                        ).hasRole("ADMIN")

                        .requestMatchers("/actuator/**").hasRole("ADMIN")

                        // =====================
                        // EVERYTHING ELSE
                        // =====================
                        .anyRequest().authenticated()
                )

                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration configuration
    ) throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true);

        config.setAllowedOrigins(List.of(
                "http://localhost:5173",
                "http://localhost:8080",
                "https://ltj54.github.io"
        ));

        config.setAllowedMethods(List.of(
                "GET", "POST", "PUT", "DELETE", "OPTIONS"
        ));

        config.setAllowedHeaders(List.of(
                "Content-Type",
                "Authorization",
                "X-Requested-With",
                "Accept"
        ));

        config.setExposedHeaders(List.of(
                "Authorization",
                "Content-Disposition"
        ));

        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        return source;
    }
}
