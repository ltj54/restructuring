package io.ltj.restructuring.api.controller;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.util.HashMap;
import java.util.Map;

@RestController
public class DatabaseController {

    private final JdbcTemplate jdbcTemplate;
    private final DataSource dataSource;

    public DatabaseController(JdbcTemplate jdbcTemplate, DataSource dataSource) {
        this.jdbcTemplate = jdbcTemplate;
        this.dataSource = dataSource;
    }

    @GetMapping("/api/dbinfo")
    public Map<String, Object> getDatabaseInfo() {
        Map<String, Object> result = new HashMap<>();

        try (Connection connection = dataSource.getConnection()) {

            DatabaseMetaData meta = connection.getMetaData();

            String version = meta.getDatabaseProductVersion();
            String product = meta.getDatabaseProductName();
            String url = meta.getURL();
            String user = meta.getUserName();

            // PostgreSQL schema
            String schema = jdbcTemplate.queryForObject("SELECT current_schema()", String.class);

            result.put("database", product);
            result.put("version", version);
            result.put("url", url);
            result.put("username", user);
            result.put("schema", schema);

            return result;

        } catch (Exception e) {
            result.put("error", "Feil ved henting av databaseinfo: " + e.getMessage());
            return result;
        }
    }
}
