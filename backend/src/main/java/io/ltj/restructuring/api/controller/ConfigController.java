package io.ltj.restructuring.api.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * 🔧 ConfigController
 * <p>
 * Endpoint: GET /api/config
 * <p>
 * IMPORTANT (security):
 * - This endpoint is intended for ADMIN diagnostics only.
 * - Never return secrets (API keys, passwords, full JDBC URLs, etc.).
 */
@RestController
public class ConfigController {

    @Value("${spring.application.name:restructuring-backend}")
    private String appName;

    @Value("${server.port:8080}")
    private String serverPort;

    private final Environment environment;

    public ConfigController(Environment environment) {
        this.environment = environment;
    }

    @GetMapping("/api/config")
    public Map<String, Object> getConfig() {
        Map<String, Object> config = new LinkedHashMap<>();
        config.put("application", appName);
        config.put("server.port", serverPort);
        config.put("activeProfiles", environment.getActiveProfiles());
        config.put("timestamp", LocalDateTime.now().toString());
        return config;
    }
}
