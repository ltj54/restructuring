package io.ltj.restructuring.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;

@Component
public class JwtDecoder {

    private final SecretKey secretKey;

    public JwtDecoder(SecretKey secretKey) {
        this.secretKey = secretKey;
    }

    public Claims decode(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
