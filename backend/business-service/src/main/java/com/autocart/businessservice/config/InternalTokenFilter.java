package com.autocart.businessservice.config;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
@Order(1)
public class InternalTokenFilter extends OncePerRequestFilter {

    @Value("${internal.api.key:${INTERNAL_API_KEY:}}")
    private String configuredInternalKey;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        if (request.getRequestURI().startsWith("/api/internal/")) {
            if (configuredInternalKey == null || configuredInternalKey.trim().isEmpty()) {
                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                response.setContentType("application/json");
                response.getWriter().write("{\"error\":\"Forbidden: Internal API key not configured on server.\"}");
                return;
            }

            String providedToken = request.getHeader("X-Internal-Token");
            if (providedToken == null || !MessageDigest.isEqual(
                    providedToken.getBytes(StandardCharsets.UTF_8),
                    configuredInternalKey.getBytes(StandardCharsets.UTF_8))) {
                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                response.setContentType("application/json");
                response.getWriter().write("{\"error\":\"Forbidden: Invalid or missing X-Internal-Token header.\"}");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }
}
