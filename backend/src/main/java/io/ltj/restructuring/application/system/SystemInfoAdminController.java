package io.ltj.restructuring.application.system;

import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.OffsetDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/system")
public class SystemInfoAdminController {

    private final JdbcTemplate jdbcTemplate;

    public SystemInfoAdminController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    /**
     * Health-check for backend.
     * Brukes av SystemInfoPage.tsx → `${API_BASE_URL}/health`
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        return ResponseEntity.ok(
                Map.of(
                        "status", "OK",
                        "timestamp", OffsetDateTime.now().toString()
                )
        );
    }

    /**
     * DB-info / ping mot databasen.
     * Brukes av SystemInfoPage.tsx → `${API_BASE_URL}/dbinfo`
     * <p>
     * Returnerer plain text.
     */
    @GetMapping("/dbinfo")
    public ResponseEntity<String> dbInfo() {
        try {
            String result = jdbcTemplate.queryForObject(
                    "select version()",
                    String.class
            );
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body("Kunne ikke hente DB-info: " + e.getMessage());
        }
    }

    /**
     * Wrapper rundt Postgres-funksjonen:
     * get_user_profile(user_id) -> json
     * <p>
     * UENDRET.
     */
    @GetMapping("/user-profile/{userId}")
    public ResponseEntity<String> getUserProfile(@PathVariable long userId) {
        String sql = "SELECT get_user_profile(?)";
        String json = jdbcTemplate.queryForObject(sql, String.class, userId);
        return ResponseEntity.ok(json);
    }
}
