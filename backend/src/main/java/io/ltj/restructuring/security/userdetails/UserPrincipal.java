package io.ltj.restructuring.security.userdetails;

import io.ltj.restructuring.domain.user.UserEntity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

public class UserPrincipal implements UserDetails {

    private final Long id;
    private final String email;
    private final String password;
    private final String role;

    public UserPrincipal(UserEntity user) {
        this.id = user.getId();
        this.email = user.getEmail();
        this.password = user.getPassword();
        this.role = user.getRole() == null ? "USER" : user.getRole().toUpperCase();
    }

    public Long getId() {
        return id;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        String normalized = role != null ? role.toUpperCase() : "USER";
        String authority = normalized.startsWith("ROLE_") ? normalized : "ROLE_" + normalized;
        return List.of(new SimpleGrantedAuthority(authority));
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
