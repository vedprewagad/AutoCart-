package com.example.demo.security;

import org.springframework.stereotype.Component;
import jakarta.servlet.http.HttpServletRequest;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class LoginAttemptLimiter {

    private static final int MAX_FAILED_ATTEMPTS = 5;
    private static final long WINDOW_MS = 15 * 60 * 1000L; // 15 minutes

    private static class Attempt {
        private final int count;
        private final long firstAttemptTime;

        public Attempt(int count, long firstAttemptTime) {
            this.count = count;
            this.firstAttemptTime = firstAttemptTime;
        }

        public int getCount() {
            return count;
        }

        public long getFirstAttemptTime() {
            return firstAttemptTime;
        }
    }

    private final Map<String, Attempt> attemptsCache = new ConcurrentHashMap<>();

    public String extractClientIp(HttpServletRequest request) {
        if (request == null) {
            return "unknown";
        }
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isBlank()) {
            return xForwardedFor.split(",")[0].trim();
        }
        String realIp = request.getHeader("X-Real-IP");
        if (realIp != null && !realIp.isBlank()) {
            return realIp.trim();
        }
        return request.getRemoteAddr() != null ? request.getRemoteAddr() : "unknown";
    }

    public boolean isBlocked(HttpServletRequest request, String email) {
        String ip = extractClientIp(request);
        return isBlocked(ip, email);
    }

    public boolean isBlocked(String ip, String email) {
        long now = System.currentTimeMillis();
        cleanUp(now);

        String pairKey = buildKey(ip, email);
        if (isKeyBlocked(pairKey, now)) {
            return true;
        }

        String ipKey = "ip:" + normalizeIp(ip);
        return isKeyBlocked(ipKey, now);
    }

    private boolean isKeyBlocked(String key, long now) {
        Attempt attempt = attemptsCache.get(key);
        if (attempt == null) {
            return false;
        }
        if (now - attempt.getFirstAttemptTime() > WINDOW_MS) {
            attemptsCache.remove(key);
            return false;
        }
        return attempt.getCount() >= MAX_FAILED_ATTEMPTS;
    }

    public void recordFailure(HttpServletRequest request, String email) {
        String ip = extractClientIp(request);
        recordFailure(ip, email);
    }

    public void recordFailure(String ip, String email) {
        long now = System.currentTimeMillis();
        String pairKey = buildKey(ip, email);
        incrementKey(pairKey, now);

        String ipKey = "ip:" + normalizeIp(ip);
        incrementKey(ipKey, now);
    }

    public void reset(HttpServletRequest request, String email) {
        String ip = extractClientIp(request);
        reset(ip, email);
    }

    public void reset(String ip, String email) {
        String pairKey = buildKey(ip, email);
        attemptsCache.remove(pairKey);
    }

    private void incrementKey(String key, long now) {
        attemptsCache.compute(key, (k, current) -> {
            if (current == null || (now - current.getFirstAttemptTime() > WINDOW_MS)) {
                return new Attempt(1, now);
            }
            return new Attempt(current.getCount() + 1, current.getFirstAttemptTime());
        });
    }

    private String buildKey(String ip, String email) {
        return normalizeIp(ip) + ":" + normalizeEmail(email);
    }

    private String normalizeIp(String ip) {
        return (ip != null && !ip.isBlank()) ? ip.trim() : "unknown";
    }

    private String normalizeEmail(String email) {
        return (email != null && !email.isBlank()) ? email.toLowerCase().trim() : "unknown";
    }

    private void cleanUp(long now) {
        if (attemptsCache.size() > 500) {
            attemptsCache.entrySet().removeIf(entry -> (now - entry.getValue().getFirstAttemptTime()) > WINDOW_MS);
        }
    }
}
