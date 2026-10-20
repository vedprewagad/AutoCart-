package com.example.demo.security;

import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

import com.example.demo.entity.Admin;
import com.example.demo.entity.User;

@Service
public class JwtService {

	@Value("${jwt.secret}")
	private String secretKey;

	@Value("${jwt.expiration}")
	private long jwtExpiration;

	@jakarta.annotation.PostConstruct
	public void validateSecret() {
		if (secretKey == null || secretKey.isBlank()) {
			throw new IllegalStateException("JWT signing key (jwt.secret) must be configured and cannot be blank.");
		}
	}

	private SecretKey getSigningKey() {
		return Keys.hmacShaKeyFor(secretKey.getBytes(StandardCharsets.UTF_8));
	}

	public String generateToken(User user) {

	    return Jwts.builder()
	            .subject(user.getEmail())
	            .claim("id", user.getId())
	            .claim("firstName", user.getFirstName())
	            .claim("lastName", user.getLastName())
	            .claim("role", user.getRole().name())
	            .issuedAt(new Date())
	            .expiration(new Date(System.currentTimeMillis() + jwtExpiration))
	            .signWith(getSigningKey())
	            .compact();
	}

	public String generateAdminToken(Admin admin) {

	    return Jwts.builder()
	            .subject(admin.getEmail())
	            .claim("id", admin.getId())
	            .claim("firstName", admin.getFirstName())
	            .claim("lastName", admin.getLastName())
	            .claim("role", admin.getRole().name())
	            .issuedAt(new Date())
	            .expiration(new Date(System.currentTimeMillis() + jwtExpiration))
	            .signWith(getSigningKey())
	            .compact();
	}
	
	public String extractRole(String token) {

	    return extractAllClaims(token)
	            .get("role", String.class);
	}

	public Claims extractClaims(String token) {

	    return extractAllClaims(token);
	}

	public String extractUsername(String token) {

		return extractAllClaims(token).getSubject();
	}

	public boolean isTokenValid(String token, UserDetails userDetails) {

		String username = extractUsername(token);

		return username.equals(userDetails.getUsername()) && !isTokenExpired(token);
	}

	private boolean isTokenExpired(String token) {

		return extractAllClaims(token).getExpiration().before(new Date());
	}

	private Claims extractAllClaims(String token) {

		return Jwts.parser().verifyWith(getSigningKey()).build().parseSignedClaims(token).getPayload();
	}
}