package io.ltj.restructuring.api.controller;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * 🧪 SystemInfoController
 * <p>
 * Endpoint: GET /api/dbversion
 * <p>
 * IMPORTANT (security):
 * - This endpoint is intended for ADMIN diagnostics only.
 * - Keep output minimal (no server details beyond what you need).
 */
@RestController
public class SystemInfoController {

    private final JdbcTemplate jdbcTemplate;

    public SystemInfoController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping("/api/dbversion")
    public Map<String, Object> getDbVersion() {
        String version = jdbcTemplate.queryForObject("SELECT version()", String.class);
        return Map.of("databaseVersion", version);
    }
}
