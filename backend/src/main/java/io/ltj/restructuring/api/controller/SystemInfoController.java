package io.ltj.restructuring.api;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class SystemInfoController {

    private final JdbcTemplate jdbcTemplate;

    public SystemInfoController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping("/api/dbversion")
    public String getDbVersion() {
        return jdbcTemplate.queryForObject("SELECT version()", String.class);
    }
}
