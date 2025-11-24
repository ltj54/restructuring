package io.ltj.restructuring.api;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class DatabaseController {

    private final JdbcTemplate jdbcTemplate;

    public DatabaseController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping("/api/dbinfo")
    public String getDatabaseVersion() {
        try {
            return jdbcTemplate.queryForObject("SELECT version()", String.class);
        } catch (Exception e) {
            return "Feil ved henting";
        }
    }
}
