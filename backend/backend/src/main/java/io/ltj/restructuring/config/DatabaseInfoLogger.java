package io.ltj.restructuring.config;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class DatabaseInfoLogger {

    private static final Logger log = LoggerFactory.getLogger(DatabaseInfoLogger.class);
    private final JdbcTemplate jdbcTemplate;

    public DatabaseInfoLogger(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @PostConstruct
    public void logDatabaseVersion() {
        String version = null;

        try {
            // PostgreSQL
            version = jdbcTemplate.queryForObject("SELECT version()", String.class);
        } catch (Exception ignored) {
            // Ignore, we'll try H2
        }

        if (version == null) {
            try {
                // H2 database
                version = jdbcTemplate.queryForObject("SELECT H2VERSION()", String.class);
            } catch (Exception ignored) {
                // Ignore, fallback below
            }
        }

        if (version == null) {
            version = "unknown";
        }

        log.atInfo()
                .addKeyValue("databaseVersion", version)
                .log("Database connection verified");
    }
}
