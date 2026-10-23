package com.backend.demo.user;


import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@Data
@NoArgsConstructor
@Builder
@AllArgsConstructor
@Entity
@Table(
        name = "_user",
        indexes = @Index(name = "idx_username", columnList = "username")
)
public class User implements UserDetails {

    @Id
    @SequenceGenerator(
            name = "user-seq",
            sequenceName = "user-seq",
            allocationSize = 1
    )
    @GeneratedValue(
            strategy = GenerationType.SEQUENCE,
            generator = "user-seq"
    )
    private Long userId;
    @Column(unique = true, nullable = false)
    private String username;
    private String name;
    @Column(unique = true, nullable = false)
    private String email;
    private String password;
    private String status;
    private String profileUrl;
    @Column(unique = true, nullable = false)
    private String objectKey;
    private boolean accountLocked;
    private boolean enabled;


    @Enumerated(EnumType.STRING)
    private Role role;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority(role.name()));
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return !accountLocked;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return enabled;
    }

    @Override
    public String getPassword() {
        return password;
    }
}
