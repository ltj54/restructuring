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

        // JWT secret must be Base64 (or Base64URL) for safe decoding
        byte[] keyBytes = decodeSecret(secret);

        // HS256 requires minimum 256-bit key
        if (keyBytes.length < 32) {
            throw new IllegalStateException(
                    "JWT secret is too short. Must be at least 256 bits (32 bytes) when Base64-decoded."
            );
        }

        return Keys.hmacShaKeyFor(keyBytes);
    }

    private byte[] decodeSecret(String secret) {
        try {
            return Decoders.BASE64.decode(secret);
        } catch (IllegalArgumentException base64Ex) {
            // Accept Base64URL (common in env vars) as a fallback
            try {
                return Decoders.BASE64URL.decode(secret);
            } catch (IllegalArgumentException base64UrlEx) {
                throw new IllegalStateException(
                        "Invalid JWT secret. It must be Base64 or Base64URL encoded (no other characters are allowed)."
                );
            }
        }
    }
}
