package com.example.demo.security;

import java.io.IOException;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import jakarta.servlet.http.Cookie;
import com.example.demo.entity.Admin;
import com.example.demo.repositories.AdminRepository;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

	private final JwtService jwtService;
	private final CustomUserDetailsService userDetailsService;
	private final AdminRepository adminRepository;

	public JwtAuthenticationFilter(JwtService jwtService, CustomUserDetailsService userDetailsService,
			AdminRepository adminRepository) {

		this.jwtService = jwtService;
		this.userDetailsService = userDetailsService;
		this.adminRepository = adminRepository;
	}

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
			throws ServletException, IOException {

		String jwt = null;

		Cookie[] cookies = request.getCookies();

		if (cookies != null) {
			for (Cookie cookie : cookies) {
				if ("jwt".equals(cookie.getName())) {
					jwt = cookie.getValue();
					break;
				}
			}
		}

		if (jwt == null) {
			filterChain.doFilter(request, response);
			return;
		}

		try {

			final String userEmail = jwtService.extractUsername(jwt);

			// Authenticate only if user isn't already authenticated
			if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {

				String role = jwtService.extractRole(jwt);

				UserDetails userDetails;

				if ("SUPER_ADMIN".equals(role) || "ADMIN".equals(role)) {

					Admin admin = adminRepository.findByEmail(userEmail)
							.orElseThrow(() -> new UsernameNotFoundException("Admin not found"));

					userDetails = org.springframework.security.core.userdetails.User.withUsername(admin.getEmail())
							.password(admin.getPasswordHash()).roles(admin.getRole().name()).build();

				} else {

					userDetails = userDetailsService.loadUserByUsername(userEmail);
				}

				if (jwtService.isTokenValid(jwt, userDetails)) {

					UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(userDetails,
							null, userDetails.getAuthorities());

					authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

					SecurityContextHolder.getContext().setAuthentication(authToken);
				}
			}

		} catch (Exception e) {

			// Invalid/expired token:
			// leave SecurityContext unauthenticated.
			// Protected endpoints will be rejected by Spring Security.
		}

		filterChain.doFilter(request, response);
	}
}