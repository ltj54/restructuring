package io.ltj.restructuring.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.ltj.restructuring.security.userdetails.UserPrincipal;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;

@Component
public class JwtEncoder {

    private final SecretKey secretKey;
    private final JwtProperties properties;

    public JwtEncoder(SecretKey secretKey, JwtProperties properties) {
        this.secretKey = secretKey;
        this.properties = properties;
    }

    public String encode(UserPrincipal principal) {
        Instant now = Instant.now();
        Instant expiry = now.plus(properties.getExpiration());

        return Jwts.builder()
                .id(UUID.randomUUID().toString())
                .subject(principal.getUsername())
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiry))
                .claim("uid", principal.getId())
                .signWith(secretKey, SignatureAlgorithm.HS256)
                .compact();
    }
}
