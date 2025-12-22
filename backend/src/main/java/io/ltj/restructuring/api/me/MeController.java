package io.ltj.restructuring.api.me;

import io.ltj.restructuring.security.JwtUserDetails;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/me")
public class MeController {

    @GetMapping
    public Map<String, Object> me(Authentication authentication) {

        if (authentication == null
                || !(authentication.getPrincipal() instanceof JwtUserDetails user)) {
            throw new IllegalStateException("No authenticated user found");
        }

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
