package io.ltj.restructuring.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.Map;

@Component
public class JwtUtil {

    private final SecretKey secretKey;

    public JwtUtil(SecretKey secretKey) {
        this.secretKey = secretKey;
    }

    /**
     * Generate JWT containing:
     *   - sub (email)
     *   - userId claim (Long)
     */
    public String generateToken(Long userId, String email) {
        long expirationMs = 1000 * 60 * 60 * 24; // 24h

        return Jwts.builder()
                .subject(email)
                .claims(Map.of("userId", userId))
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expirationMs))
                .signWith(secretKey, Jwts.SIG.HS256)
                .compact();
    }

    /**
     * Decode JWT → Claims
     */
    public Claims decode(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public boolean isTokenExpired(Date expiration) {
        return expiration.before(new Date());
    }
}
