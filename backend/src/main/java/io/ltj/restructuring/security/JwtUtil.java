package io.ltj.restructuring.security;

import io.jsonwebtoken.Jwts;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class JwtUtil {

    private final SecretKey secretKey;

    public JwtUtil(SecretKey secretKey) {
        this.secretKey = secretKey;
    }

    public String generateToken(String username) {
        long expirationMs = 1000 * 60 * 60 * 24; // 24 timer

        return Jwts.builder()
                .subject(username)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expirationMs))
                .signWith(secretKey, Jwts.SIG.HS256)
                .compact();
    }

    public boolean isTokenExpired(Date expiration) {
        return expiration.before(new Date());
    }
}
