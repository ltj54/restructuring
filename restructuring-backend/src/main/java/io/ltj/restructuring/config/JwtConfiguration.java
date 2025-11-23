package io.ltj.restructuring.config;

import io.ltj.restructuring.security.JwtProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.crypto.SecretKey;

import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;

@Configuration
@EnableConfigurationProperties(JwtProperties.class)
public class JwtConfiguration {

    @Bean
    public SecretKey jwtSecretKey(JwtProperties properties) {
        String secret = properties.getSecret();

        if (secret == null || secret.isBlank()) {
            throw new IllegalStateException(
                    "JWT secret is missing. Set 'jwt.secret' in application.properties or Render env vars."
            );
        }

        // 💡 JWT secret **må** være Base64 for sikker drift
        byte[] keyBytes;
        try {
            keyBytes = Decoders.BASE64.decode(secret);
        } catch (IllegalArgumentException ex) {
            throw new IllegalStateException(
                    "Invalid JWT secret. It MUST be Base64 encoded. Provided value was not valid Base64."
            );
        }

        // HS256 krever minimum 256-bit nøkkel
        if (keyBytes.length < 32) {
            throw new IllegalStateException(
                    "JWT secret is too short. Must be at least 256 bits (32 bytes) when Base64-decoded."
            );
        }

        return Keys.hmacShaKeyFor(keyBytes);
    }
}
