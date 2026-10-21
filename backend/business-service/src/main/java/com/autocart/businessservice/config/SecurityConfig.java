package com.autocart.businessservice.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.autocart.businessservice.security.JwtAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final InternalTokenFilter internalTokenFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthFilter, InternalTokenFilter internalTokenFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
        this.internalTokenFilter = internalTokenFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers("/api/internal/**").permitAll()
                .requestMatchers("/api/admin/**").hasAnyRole("SUPER_ADMIN", "ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/brands/**", "/api/models/**", "/api/variants/**", "/api/vehicles/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/ratings/dealer/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/variants/**").hasAnyRole("SUPER_ADMIN", "ADMIN")
                .requestMatchers("/api/ratings/user/**").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/ratings/**").authenticated()
                .requestMatchers("/api/dealer/**").hasAnyRole("DEALER", "SUPER_ADMIN", "ADMIN")
                .requestMatchers("/api/test-drives/**").authenticated()
                .anyRequest().authenticated()
            )
            .addFilterBefore(internalTokenFilter, UsernamePasswordAuthenticationFilter.class)
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
