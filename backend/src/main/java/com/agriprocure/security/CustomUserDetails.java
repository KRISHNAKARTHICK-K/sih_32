package com.agriprocure.security;

import com.agriprocure.entity.Role;
import com.agriprocure.entity.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;
import java.util.UUID;

public class CustomUserDetails implements UserDetails {

    private final User user;
    private final UUID farmerId;
    private final UUID centreId;
    private final String fullName;

    public CustomUserDetails(User user, UUID farmerId, UUID centreId, String fullName) {
        this.user = user;
        this.farmerId = farmerId;
        this.centreId = centreId;
        this.fullName = fullName;
    }

    public User getUser() {
        return user;
    }

    public UUID getUserId() {
        return user.getId();
    }

    public Role getRole() {
        return user.getRole();
    }

    public UUID getFarmerId() {
        return farmerId;
    }

    public UUID getCentreId() {
        return centreId;
    }

    public String getFullName() {
        return fullName;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()));
    }

    @Override
    public String getPassword() {
        return user.getPassword();
    }

    @Override
    public String getUsername() {
        return user.getUsername();
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
        return user.isEnabled();
    }
}
