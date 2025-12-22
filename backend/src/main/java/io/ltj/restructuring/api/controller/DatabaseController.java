package io.ltj.restructuring.api.controller;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.util.HashMap;
import java.util.Map;

/**
 * 🧪 DatabaseController
 * <p>
 * Endpoint: GET /api/dbinfo
 * <p>
 * IMPORTANT (security):
 * - This endpoint is intended for ADMIN diagnostics only.
 * - Do NOT return full JDBC url/username/password.
 */
@RestController
public class DatabaseController {

    private final JdbcTemplate jdbcTemplate;

    public DatabaseController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping("/api/dbinfo")
    public Map<String, Object> getDbInfo() {
        Map<String, Object> result = new HashMap<>();

        try (Connection conn = jdbcTemplate.getDataSource().getConnection()) {
            DatabaseMetaData meta = conn.getMetaData();

            result.put("database", meta.getDatabaseProductName());
            result.put("version", meta.getDatabaseProductVersion());
            result.put("driver", meta.getDriverName());
            result.put("driverVersion", meta.getDriverVersion());
            result.put("schema", conn.getSchema());

            return result;

        } catch (Exception e) {
            result.put("error", "Feil ved henting av databaseinfo: " + e.getMessage());
            return result;
        }
    }
}
