package io.ltj.restructuring.api.me;

import io.ltj.restructuring.security.JwtUserDetails;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class MeController {

    @GetMapping("/api/me")
    public Map<String, Object> me(Authentication authentication) {

        if (authentication == null || !(authentication.getPrincipal() instanceof JwtUserDetails)) {
            throw new IllegalStateException("No authenticated user found");
        }

        JwtUserDetails user = (JwtUserDetails) authentication.getPrincipal();

        return Map.of(
                "userId", user.getId(),
                "email", user.getUsername(),
                "authorities", user.getAuthorities()
                        .stream()
                        .map(a -> a.getAuthority())
                        .toList()
        );
    }
}
