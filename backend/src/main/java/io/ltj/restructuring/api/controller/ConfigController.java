package io.ltj.restructuring.api.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * 🔧 ConfigController
 * Returnerer system- og miljøinformasjon til frontend.
 * Endpoint: GET /api/config
 */
@RestController
@RequestMapping("/api")
public class ConfigController {

    private final Environment environment;

    @Value("${spring.application.name:Restructuring Backend}")
    private String appName;

    @Value("${server.port:8080}")
    private String serverPort;

    @Value("${spring.datasource.url:ukjent}")
    private String datasourceUrl;

    public ConfigController(Environment environment) {
        this.environment = environment;
    }

    @GetMapping("/config")
    public Map<String, Object> getConfig() {
        Map<String, Object> config = new LinkedHashMap<>();
        config.put("application", appName);
        config.put("server.port", serverPort);
        config.put("spring.datasource.url", datasourceUrl);
        config.put("activeProfiles", environment.getActiveProfiles());
        config.put("timestamp", LocalDateTime.now().toString());
        return config;
    }
}
